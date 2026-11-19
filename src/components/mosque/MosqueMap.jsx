import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatDistance } from "../../api/mosqueApi";
import { getDirectionsUrl, travelEstimate } from "../../utils/MosqueUtils ";

// DivIcons avoid the broken default marker images in Vite
const userLocationIcon = L.divIcon({
  className: "custom-user-pin",
  html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#2563eb;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const iconCache = new Map();
function getMosqueIcon(isSelected, isVerified) {
  const key = `${isSelected}-${isVerified}`;
  if (iconCache.has(key)) return iconCache.get(key);
  const size = isSelected ? 38 : 30;
  const bg = isSelected ? "#d97706" : isVerified ? "#059669" : "#475569";
  const icon = L.divIcon({
    className: "custom-mosque-pin",
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${bg};color:#fff;border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:${isSelected ? 17 : 14}px;">🕌</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
  iconCache.set(key, icon);
  return icon;
}

// Zooms to show the whole search area (this is what keeps the map from being zoomed out to a continent)
function MapController({ lat, lon, radiusMeters, selected }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLng(lat, lon).toBounds(radiusMeters * 2);
    map.fitBounds(bounds, { padding: [12, 12] });
  }, [lat, lon, radiusMeters, map]);

  const selLat = selected?.lat;
  const selLon = selected?.lon;
  useEffect(() => {
    if (selLat == null) return;
    map.flyTo([selLat, selLon], Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [selLat, selLon, map]);

  return null;
}

const MosqueMap = ({ userCoords, radiusMeters, mosques, selectedMosque, onSelectMosque }) => {
  if (!userCoords) return null;
  const center = [userCoords.lat, userCoords.lon];

  return (
    <div className="relative isolate w-full h-[340px] lg:h-[560px] rounded-3xl overflow-hidden border border-theme shadow-lg">
      <MapContainer center={center} zoom={14} scrollWheelZoom className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          lat={userCoords.lat}
          lon={userCoords.lon}
          radiusMeters={radiusMeters}
          selected={selectedMosque}
        />

        <Circle
          center={center}
          radius={radiusMeters}
          pathOptions={{
            color: "#10b981",
            fillColor: "#10b981",
            fillOpacity: 0.06,
            weight: 1.5,
            dashArray: "6, 6",
          }}
        />

        <Marker position={center} icon={userLocationIcon}>
          <Popup>
            <strong>You are here</strong>
          </Popup>
        </Marker>

        {mosques.map((m) => (
          <Marker
            key={m.osm_id}
            position={[m.lat, m.lon]}
            title={m.name}
            icon={getMosqueIcon(selectedMosque?.osm_id === m.osm_id, m.communityVerified)}
            zIndexOffset={selectedMosque?.osm_id === m.osm_id ? 1000 : 0}
            eventHandlers={{ click: () => onSelectMosque(m) }}
          >
            <Popup>
              <div className="min-w-[170px] space-y-1">
                <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                <p className="text-xs text-slate-600">
                  {formatDistance(m.distanceKm)} away, {travelEstimate(m).label}
                </p>
                <a
                  href={getDirectionsUrl(m)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs font-bold text-emerald-700 underline"
                >
                  Get directions
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MosqueMap;