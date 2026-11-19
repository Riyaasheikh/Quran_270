import api from "../lib/axios";
import { normalizeTime } from "../utils/MosqueUtils ";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const COMMUNITY_CHUNK_SIZE = 120; // keeps each GET url comfortably short
const OSM_CACHE_TTL_MS = 5 * 60 * 1000;
const osmCache = new Map();

// Haversine formula: exact distance in km between two GPS points
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// "450 m" or "2.3 km"
export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

// Turn a typed place ("Gulberg, Lahore") into coordinates using OpenStreetMap Nominatim
export async function geocodePlace(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error("Place search failed");
  const results = await res.json();
  if (!results.length) return null;

  const top = results[0];
  return {
    lat: parseFloat(top.lat),
    lon: parseFloat(top.lon),
    label: String(top.display_name).split(",").slice(0, 2).join(",").trim(),
  };
}

async function fetchOsmElements(lat, lon, radiusMeters, signal) {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)},${radiusMeters}`;
  const cached = osmCache.get(cacheKey);
  if (cached && Date.now() - cached.at < OSM_CACHE_TTL_MS) return cached.elements;

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});
      way["building"="mosque"](around:${radiusMeters},${lat},${lon});
    );
    out center tags;
  `;

  // Try each public Overpass server in turn: if one is busy, the next usually works
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal,
      });
      if (!response.ok) throw new Error(`Overpass responded with ${response.status}`);
      const data = await response.json();
      const elements = data.elements || [];
      osmCache.set(cacheKey, { at: Date.now(), elements });
      return elements;
    } catch (err) {
      if (err.name === "AbortError") throw err;
    }
  }

  throw new Error("We couldn't load masjid data. Check your connection and try again.");
}

function toMosque(el, userLat, userLon) {
  const mLat = el.lat ?? el.center?.lat;
  const mLon = el.lon ?? el.center?.lon;
  if (mLat == null || mLon == null) return null;

  const tags = el.tags || {};
  const isMusalla = tags.place_of_worship === "musalla";
  const distanceKm = getDistanceKm(userLat, userLon, mLat, mLon);

  return {
    osm_id: `${el.type}_${el.id}`,
    name:
      tags.name ||
      tags["name:en"] ||
      tags["name:ur"] ||
      (isMusalla ? "Prayer room (Musalla)" : "Local masjid"),
    arabicName: tags["name:ar"] || null,
    type: isMusalla ? "Musalla" : "Masjid",
    lat: mLat,
    lon: mLon,
    distanceKm,
    walkingMinutes: Math.max(1, Math.round((distanceKm / 4.8) * 60)),
    drivingMinutes: Math.max(1, Math.round((distanceKm / 30) * 60)),
    address: [tags["addr:street"], tags["addr:suburb"], tags["addr:city"]]
      .filter(Boolean)
      .join(", "),
    phone: tags.phone || tags["contact:phone"] || null,
    // Best guesses from OpenStreetMap. They stay "unconfirmed" until the community verifies them.
    facilities: {
      womenSection: tags.female === "yes" || tags.segregated === "yes",
      wuduArea: tags.toilets === "yes" || !isMusalla,
      wheelchair: tags.wheelchair === "yes" || tags.wheelchair === "limited",
      parking: tags.parking === "yes" || Boolean(tags["parking:lane"]),
      ac: tags.air_conditioning === "yes",
      jumuah: !isMusalla,
    },
    jamaah: { fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null, jumuah: null },
    communityVerified: false,
    verificationsCount: 0,
    updatedAt: null,
  };
}

// Merge one saved community record (from Laravel) onto a mosque object
export function applyCommunityRecord(mosque, saved) {
  return {
    ...mosque,
    facilities: {
      womenSection: Boolean(saved.has_women_section),
      wuduArea: Boolean(saved.has_wudu_area),
      wheelchair: Boolean(saved.has_wheelchair_access),
      parking: Boolean(saved.has_parking),
      ac: Boolean(saved.has_ac),
      jumuah: Boolean(saved.has_jumuah),
    },
    jamaah: {
      fajr: normalizeTime(saved.fajr_jamaah),
      dhuhr: normalizeTime(saved.dhuhr_jamaah),
      asr: normalizeTime(saved.asr_jamaah),
      maghrib: normalizeTime(saved.maghrib_jamaah),
      isha: normalizeTime(saved.isha_jamaah),
      jumuah: normalizeTime(saved.jumuah_jamaah),
    },
    communityVerified: true,
    verificationsCount: saved.verifications_count || 1,
    updatedAt: saved.updated_at || null,
  };
}

// Looks up community records in small batches. A big area can contain 1,000+ masjids,
// which would make a single GET url too long and the request would silently fail.
async function fetchCommunityRecords(osmIds, signal) {
  const chunks = [];
  for (let i = 0; i < osmIds.length; i += COMMUNITY_CHUNK_SIZE) {
    chunks.push(osmIds.slice(i, i + COMMUNITY_CHUNK_SIZE));
  }

  const parts = await Promise.all(
    chunks.map((ids) =>
      api
        .get("/api/mosques/facilities", { params: { osm_ids: ids.join(",") }, signal })
        .then((res) => res.data || {})
        .catch(() => ({})) // backend offline? still show OpenStreetMap data
    )
  );

  return Object.assign({}, ...parts);
}

export async function fetchNearbyMosques(lat, lon, radiusMeters = 3000, { signal } = {}) {
  const elements = await fetchOsmElements(lat, lon, radiusMeters, signal);

  const mosques = elements
    .map((el) => toMosque(el, lat, lon))
    .filter(Boolean)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  if (mosques.length === 0) return mosques;

  const community = await fetchCommunityRecords(
    mosques.map((m) => m.osm_id),
    signal
  );

  return mosques.map((m) => (community[m.osm_id] ? applyCommunityRecord(m, community[m.osm_id]) : m));
}

export async function saveMosqueFacilities(payload) {
  const { data } = await api.post("/api/mosques/facilities", payload);
  return data;
}