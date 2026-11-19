import React, { useState } from "react";
import { RiCrosshair2Line, RiSearchLine, RiLoader4Line } from "@remixicon/react";
import { geocodePlace } from "../../api/mosqueApi";

// Shown whenever we are NOT using the person's live location,
// so they always know where results are coming from and can change it.
const LocationBanner = ({ status, label, onUseMyLocation, onPickPlace }) => {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const place = label || "Lahore";
  const message =
    status === "acquiring"
      ? "Finding your location..."
      : status === "active"
      ? "Showing masjids near your current location. Or type a city or area to look somewhere else."
      : status === "manual"
      ? `Showing masjids near ${place}.`
      : status === "denied"
      ? `Location access is blocked, so we're showing masjids near ${place}. Allow location in your browser settings, then tap "Use my location".`
      : `We couldn't get your location, so we're showing masjids near ${place}.`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setBusy(true);
    setError("");
    try {
      const result = await geocodePlace(q);
      if (!result) {
        setError("We couldn't find that place. Try a city or neighbourhood name.");
      } else {
        onPickPlace(result);
        setQuery("");
      }
    } catch {
      setError("Place search isn't working right now. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="theme-card rounded-2xl border border-theme p-4 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <p className="text-sm theme-text flex-1">{message}</p>

        <form onSubmit={handleSubmit} className="flex gap-2 lg:w-[26rem]" role="search">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a city or area, e.g. Gulberg"
            aria-label="Search for a place"
            className="theme-input text-sm flex-1"
          />
          <button
            type="submit"
            disabled={busy || !query.trim()}
            className="theme-button px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 disabled:opacity-60"
          >
            {busy ? <RiLoader4Line size={16} className="animate-spin" /> : <RiSearchLine size={16} />}
            <span>Search</span>
          </button>
        </form>

        <button
          type="button"
          onClick={onUseMyLocation}
          className="theme-button-outline px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"
        >
          <RiCrosshair2Line size={16} />
          <span>Use my location</span>
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs font-semibold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default LocationBanner;