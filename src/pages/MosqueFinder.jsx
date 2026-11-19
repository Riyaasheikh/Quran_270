import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  RiLoader4Line,
  RiMapLine,
  RiCompass3Line,
  RiRadarLine,
  RiRefreshLine,
} from "@remixicon/react";

import Navbar from "../components/global/Navbar";
import Footer from "../components/global/Footer";
import MosqueMap from "../components/mosque/MosqueMap";
import MosqueCard from "../components/mosque/MosqueCard";
import LocationBanner from "../components/mosque/LocationBanner";
import FacilityUpdateModal from "../components/mosque/FacilityUpdateModal";
import { fetchNearbyMosques, applyCommunityRecord } from "../api/mosqueApi";
import useUserLocation from "../data/UseUserLocation";
import { FACILITIES, getDirectionsUrl } from "../utils/MosqueUtils ";
import { AuthContext } from "../context/AuthContext";

const RADIUS_OPTIONS = [
  { label: "1 km", value: 1000 },
  { label: "3 km", value: 3000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
];

const PAGE_SIZE = 12;

const MosqueFinder = () => {
  const { user } = useContext(AuthContext);
  const { coords, status, label, retry, setManualLocation } = useUserLocation();

  const [radiusMeters, setRadiusMeters] = useState(3000);
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedId, setSelectedId] = useState(null);
  const [editingMosque, setEditingMosque] = useState(null);
  const [nameFilter, setNameFilter] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [now, setNow] = useState(() => new Date());
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const scrollTarget = useRef(null);

  // Keeps "next prayer in 25 min" fresh
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  }, []);

  // Load masjids whenever the location, radius or "refresh" changes
  useEffect(() => {
    if (!coords) return;
    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError("");

    fetchNearbyMosques(coords.lat, coords.lon, radiusMeters, { signal: controller.signal })
      .then((results) => {
        if (cancelled) return;
        setMosques(results);
        setVisibleCount(PAGE_SIZE);
      })
      .catch((err) => {
        if (cancelled || err.name === "AbortError") return;
        setMosques([]);
        setError(err.message || "We couldn't load nearby masjids.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [coords?.lat, coords?.lon, radiusMeters, reloadKey]);

  const filteredMosques = useMemo(() => {
    const q = nameFilter.trim().toLowerCase();
    return mosques.filter((m) => {
      const matchesName =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.arabicName || "").toLowerCase().includes(q) ||
        (m.address || "").toLowerCase().includes(q);
      const matchesFacilities = Object.entries(activeFilters).every(
        ([key, required]) => !required || Boolean(m.facilities[key])
      );
      return matchesName && matchesFacilities;
    });
  }, [mosques, nameFilter, activeFilters]);

  const selectedMosque = useMemo(
    () => mosques.find((m) => m.osm_id === selectedId) || null,
    [mosques, selectedId]
  );

  // The map shows up to 200 nearest, which keeps it fast in big cities
  const mapMosques = useMemo(() => {
    const list = filteredMosques.slice(0, 200);
    if (selectedMosque && !list.some((m) => m.osm_id === selectedMosque.osm_id)) {
      list.push(selectedMosque);
    }
    return list;
  }, [filteredMosques, selectedMosque]);

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;
  const radiusLabel = RADIUS_OPTIONS.find((o) => o.value === radiusMeters)?.label;
  const nextRadius = RADIUS_OPTIONS.find((o) => o.value > radiusMeters);

  // Tapping a pin on the map scrolls the matching card into view
  const handleSelectFromMap = useCallback((m) => {
    scrollTarget.current = m.osm_id;
    setSelectedId(m.osm_id);
  }, []);

  useEffect(() => {
    const id = scrollTarget.current;
    if (!id) return;
    const index = filteredMosques.findIndex((m) => m.osm_id === id);
    if (index === -1) {
      scrollTarget.current = null;
      return;
    }
    if (index >= visibleCount) {
      setVisibleCount(index + 1);
      return;
    }
    document.getElementById(`mosque-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    scrollTarget.current = null;
  }, [selectedId, filteredMosques, visibleCount]);

  const handleSaved = (record) => {
    setMosques((prev) => prev.map((m) => (m.osm_id === record.osm_id ? applyCommunityRecord(m, record) : m)));
    showToast(`Thanks! ${editingMosque?.name || "The masjid"} was updated.`);
  };

  const handleShare = async (m) => {
    const url = getDirectionsUrl(m);
    const text = `${m.name}${m.address ? `, ${m.address}` : ""}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: m.name, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      showToast("Link copied to clipboard.");
    } catch (err) {
      if (err?.name !== "AbortError") showToast("We couldn't share this. Please try again.");
    }
  };

  const statusText =
    status === "active"
      ? "Using your live location"
      : status === "acquiring"
      ? "Finding your location..."
      : status === "manual"
      ? `Showing ${label}`
      : `Location is off. Showing ${label || "Lahore"}`;

  return (
    <div className="theme-page min-h-screen theme-transition flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Header */}
        <section className="border-b border-theme bg-theme-overlay py-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 theme-badge theme-badge-accent text-xs font-bold mb-2.5">
                <RiRadarLine size={14} className={status === "active" ? "animate-pulse" : ""} />
                <span>{statusText}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight theme-text">
                Find a masjid near you
              </h1>
              <p className="theme-muted text-sm mt-1.5 max-w-xl">
                See the closest masjids, their jama'ah times and facilities, and get directions in one tap.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div role="group" aria-label="Search distance" className="flex p-1 rounded-2xl border border-theme bg-theme-soft">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={radiusMeters === opt.value}
                    onClick={() => setRadiusMeters(opt.value)}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                      radiusMeters === opt.value
                        ? "bg-accent text-[var(--accent-foreground)]"
                        : "theme-muted hover:theme-text"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <Link to="/prayer-times" className="theme-button-outline px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-1.5">
                <RiCompass3Line size={16} className="theme-gold" />
                <span>Qibla compass</span>
              </Link>
            </div>
          </div>
        </section>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5 pb-12">
          {/* City search + "use my location" */}
          <LocationBanner
            status={status}
            label={label}
            onUseMyLocation={retry}
            onPickPlace={setManualLocation}
          />

          {/* Results header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold theme-text">
              {loading && mosques.length === 0
                ? "Looking for masjids..."
                : `${filteredMosques.length} ${filteredMosques.length === 1 ? "masjid" : "masjids"} within ${radiusLabel}`}
            </h2>
            <div className="flex items-center gap-2">
              {loading && mosques.length > 0 && (
                <span className="flex items-center gap-1.5 text-xs theme-muted">
                  <RiLoader4Line size={14} className="animate-spin" /> Updating
                </span>
              )}
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                disabled={loading}
                aria-label="Refresh results"
                className="theme-button-outline p-2.5 rounded-xl cursor-pointer"
              >
                <RiRefreshLine size={16} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                type="button"
                onClick={() => setShowMap((v) => !v)}
                aria-pressed={showMap}
                className="theme-button-outline px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RiMapLine size={16} />
                <span>{showMap ? "Hide map" : "Show map"}</span>
              </button>
            </div>
          </div>

          {/* Optional filters (only when there is something to filter) */}
          {mosques.length > 0 && (
            <div className="space-y-2.5">
              <input
                type="search"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Filter by masjid name or street"
                aria-label="Filter results by name or street"
                className="theme-input text-sm w-full"
              />
              <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
                {FACILITIES.map((f) => {
                  const active = Boolean(activeFilters[f.key]);
                  return (
                    <button
                      key={f.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setActiveFilters((prev) => ({ ...prev, [f.key]: !prev[f.key] }))}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                        active
                          ? "bg-accent text-[var(--accent-foreground)] border-accent"
                          : "bg-theme-soft border-theme theme-muted hover:theme-text"
                      }`}
                    >
                      <span aria-hidden="true">{f.emoji}</span> {f.short}
                    </button>
                  );
                })}
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveFilters({})}
                    className="shrink-0 px-3 py-1.5 text-xs font-bold theme-accent underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}

          <div className={showMap ? "grid lg:grid-cols-2 gap-5 items-start" : ""}>
            {/* Map (optional) */}
            {showMap && (
              <div className="lg:order-2 lg:sticky lg:top-20">
                <MosqueMap
                  userCoords={coords}
                  radiusMeters={radiusMeters}
                  mosques={mapMosques}
                  selectedMosque={selectedMosque}
                  onSelectMosque={handleSelectFromMap}
                />
              </div>
            )}

            {/* Results */}
            <div className="lg:order-1 min-w-0">
              {loading && mosques.length === 0 ? (
                <div className="space-y-3" aria-busy="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="theme-card rounded-2xl border border-theme p-5 animate-pulse space-y-3">
                      <div className="h-4 w-2/3 rounded bg-theme-soft" />
                      <div className="h-3 w-1/2 rounded bg-theme-soft" />
                      <div className="h-3 w-3/4 rounded bg-theme-soft" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div role="alert" className="theme-card rounded-2xl border border-red-500/30 p-8 text-center">
                  <p className="text-sm font-bold text-red-500">{error}</p>
                  <button
                    type="button"
                    onClick={() => setReloadKey((k) => k + 1)}
                    className="theme-button mt-3 px-4 py-2 rounded-xl text-sm font-bold"
                  >
                    Try again
                  </button>
                </div>
              ) : mosques.length === 0 ? (
                <div className="theme-card rounded-2xl border border-dashed border-theme p-10 text-center space-y-3">
                  <p className="text-base font-bold theme-text">No masjids found within {radiusLabel}</p>
                  <p className="text-sm theme-muted">
                    Try a wider search, or type a different city or area above.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {nextRadius && (
                      <button
                        type="button"
                        onClick={() => setRadiusMeters(nextRadius.value)}
                        className="theme-button px-4 py-2 rounded-xl text-sm font-bold"
                      >
                        Search within {nextRadius.label}
                      </button>
                    )}
                    <a
                      href="https://www.openstreetmap.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="theme-button-outline px-4 py-2 rounded-xl text-sm font-bold"
                    >
                      Add a missing masjid on OpenStreetMap
                    </a>
                  </div>
                </div>
              ) : filteredMosques.length === 0 ? (
                <div className="theme-card rounded-2xl border border-dashed border-theme p-10 text-center space-y-3">
                  <p className="text-base font-bold theme-text">No masjids match your filters</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilters({});
                      setNameFilter("");
                    }}
                    className="theme-button px-4 py-2 rounded-xl text-sm font-bold"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  <div className={`grid gap-3 ${showMap ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                    {filteredMosques.slice(0, visibleCount).map((m) => (
                      <MosqueCard
                        key={m.osm_id}
                        mosque={m}
                        isSelected={selectedId === m.osm_id}
                        now={now}
                        onSelect={() => setSelectedId(m.osm_id)}
                        onEdit={() => setEditingMosque(m)}
                        onShare={() => handleShare(m)}
                      />
                    ))}
                  </div>

                  {filteredMosques.length > visibleCount && (
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                        className="theme-button-outline px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
                      >
                        Show {Math.min(PAGE_SIZE, filteredMosques.length - visibleCount)} more (
                        {filteredMosques.length - visibleCount} left)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[140] theme-card border border-theme rounded-xl px-4 py-2.5 text-sm font-semibold theme-text shadow-xl"
        >
          {toast}
        </div>
      )}

      {editingMosque && (
        <FacilityUpdateModal
          mosque={editingMosque}
          user={user}
          onClose={() => setEditingMosque(null)}
          onSaved={handleSaved}
        />
      )}

      <Footer />
    </div>
  );
};

export default MosqueFinder;