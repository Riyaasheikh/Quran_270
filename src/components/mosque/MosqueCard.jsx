import React, { useMemo } from "react";
import {
  RiNavigationLine,
  RiWalkLine,
  RiCarLine,
  RiShieldCheckLine,
  RiEditLine,
  RiShareLine,
  RiPhoneLine,
  RiTimeLine,
} from "@remixicon/react";
import { formatDistance } from "../../api/mosqueApi";
import {
  FACILITIES,
  JAMAAH_FIELDS,
  formatCountdown,
  formatTime12,
  getDirectionsUrl,
  getNextJamaah,
  timeAgo,
  travelEstimate,
} from "../../utils/MosqueUtils ";

const MosqueCard = ({ mosque, isSelected, now, onSelect, onEdit, onShare }) => {
  const next = useMemo(() => getNextJamaah(mosque.jamaah, now), [mosque.jamaah, now]);
  const travel = travelEstimate(mosque);
  const TravelIcon = travel.mode === "walking" ? RiWalkLine : RiCarLine;
  const facilities = FACILITIES.filter((f) => mosque.facilities[f.key]);
  const hasTimes = JAMAAH_FIELDS.some((f) => mosque.jamaah[f.key]);

  return (
    <article
      id={`mosque-${mosque.osm_id}`}
      className={`theme-card rounded-2xl border transition-colors ${
        isSelected ? "border-accent ring-2 ring-accent/20" : "border-theme"
      }`}
    >
      {/* Tap anywhere on the summary to show it on the map */}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className="block w-full text-start p-4 sm:p-5 cursor-pointer rounded-2xl"
      >
        <span className="flex items-start justify-between gap-3">
          <span className="block min-w-0">
            <span className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="theme-badge theme-badge-gold text-[11px] font-bold py-0 px-2">
                {mosque.type}
              </span>
              {mosque.communityVerified && (
                <span className="inline-flex items-center gap-1 theme-badge theme-badge-accent text-[11px] font-bold py-0 px-2">
                  <RiShieldCheckLine size={12} />
                  <span>
                    Verified by {mosque.verificationsCount}{" "}
                    {mosque.verificationsCount === 1 ? "person" : "people"}
                  </span>
                </span>
              )}
            </span>
            <span className="block text-base font-extrabold theme-text leading-snug">
              {mosque.name}
            </span>
            {mosque.address && (
              <span className="block text-xs theme-muted mt-0.5">{mosque.address}</span>
            )}
          </span>

          <span className="block shrink-0 text-end bg-theme-soft px-3 py-1.5 rounded-xl border border-theme">
            <span className="block text-sm font-black theme-accent">
              {formatDistance(mosque.distanceKm)}
            </span>
            <span className="flex items-center justify-end gap-1 text-[11px] theme-muted font-semibold">
              <TravelIcon size={12} />
              <span>{travel.label}</span>
            </span>
          </span>
        </span>

        {/* Next jama'ah: the thing people actually came here to find out */}
        {next ? (
          <span className="mt-3 flex items-center gap-2 rounded-xl bg-accent-soft border border-accent px-3 py-2">
            <RiTimeLine size={16} className="theme-accent shrink-0" />
            <span className="text-sm theme-text">
              <strong className="font-extrabold">
                {next.label}
                {next.tomorrow ? " tomorrow" : ""}
              </strong>{" "}
              at <span dir="ltr">{formatTime12(next.time)}</span>
              {!next.tomorrow && (
                <span className="theme-muted font-semibold"> ({formatCountdown(next.inMinutes)})</span>
              )}
            </span>
          </span>
        ) : (
          <span className="mt-3 block text-xs theme-muted">
            No jama'ah times yet. Know them? Tap "{mosque.communityVerified ? "Update info" : "Add details"}" below.
          </span>
        )}

        {/* Facilities. Dashed chips = best guess from OpenStreetMap, not yet confirmed */}
        {facilities.length > 0 && (
          <span className="mt-3 flex flex-wrap gap-1.5">
            {facilities.map((f) => (
              <span
                key={f.key}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-theme-soft theme-text border ${
                  mosque.communityVerified ? "border-theme" : "border-dashed border-theme"
                }`}
              >
                <span aria-hidden="true">{f.emoji}</span> {f.short}
              </span>
            ))}
          </span>
        )}
        {!mosque.communityVerified && facilities.length > 0 && (
          <span className="mt-1.5 block text-[11px] theme-muted">
            Facilities are estimated from map data and not yet confirmed.
          </span>
        )}

        {/* Full schedule, shown once the card is selected */}
        {isSelected && hasTimes && (
          <span dir="ltr" className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
            {JAMAAH_FIELDS.map((f) =>
              mosque.jamaah[f.key] ? (
                <span key={f.key} className="block p-1.5 rounded-lg bg-theme-soft border border-theme">
                  <span className="block text-[11px] font-semibold theme-subtle">{f.label}</span>
                  <span className="block text-xs font-extrabold theme-text">
                    {formatTime12(mosque.jamaah[f.key])}
                  </span>
                </span>
              ) : null
            )}
          </span>
        )}

        {mosque.communityVerified && mosque.updatedAt && (
          <span className="mt-2 block text-[11px] theme-muted">
            Last updated {timeAgo(mosque.updatedAt)}
          </span>
        )}
      </button>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 pb-4 sm:pb-5">
        <a
          href={getDirectionsUrl(mosque)}
          target="_blank"
          rel="noopener noreferrer"
          className="theme-button flex-1 min-w-[9rem] justify-center px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5"
        >
          <RiNavigationLine size={16} />
          <span>Directions</span>
        </a>

        {mosque.phone && (
          <a
            href={`tel:${mosque.phone}`}
            aria-label={`Call ${mosque.name}`}
            className="theme-button-outline p-2.5 rounded-xl flex items-center"
          >
            <RiPhoneLine size={16} />
          </a>
        )}

        <button
          type="button"
          onClick={onShare}
          aria-label={`Share ${mosque.name}`}
          className="theme-button-outline p-2.5 rounded-xl flex items-center cursor-pointer"
        >
          <RiShareLine size={16} />
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="theme-button-outline px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <RiEditLine size={16} />
          <span>{mosque.communityVerified ? "Update info" : "Add details"}</span>
        </button>
      </div>
    </article>
  );
};

export default React.memo(MosqueCard);