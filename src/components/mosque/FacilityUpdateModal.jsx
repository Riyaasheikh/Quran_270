import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RiCloseLine, RiCheckDoubleLine, RiTimeLine, RiLockLine } from "@remixicon/react";
import { saveMosqueFacilities } from "../../api/mosqueApi";
import { FACILITIES, JAMAAH_FIELDS, normalizeTime } from "../../utils/MosqueUtils ";

const buildInitialForm = (mosque) => {
  const form = {};
  FACILITIES.forEach((f) => {
    form[f.apiKey] = Boolean(mosque.facilities[f.key]);
  });
  JAMAAH_FIELDS.forEach((f) => {
    form[`${f.key}_jamaah`] = normalizeTime(mosque.jamaah[f.key]) || "";
  });
  return form;
};

const FacilityUpdateModal = ({ mosque, user, onClose, onSaved, loginPath = "/login" }) => {
  const initialRef = useRef(buildInitialForm(mosque));
  const [form, setForm] = useState(initialRef.current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dirty = JSON.stringify(form) !== JSON.stringify(initialRef.current);

  // Escape closes, page behind stops scrolling
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggle = (key) => setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  const setTime = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = { osm_id: mosque.osm_id, name: mosque.name, latitude: mosque.lat, longitude: mosque.lon };
    FACILITIES.forEach((f) => (payload[f.apiKey] = form[f.apiKey]));
    JAMAAH_FIELDS.forEach((f) => (payload[`${f.key}_jamaah`] = form[`${f.key}_jamaah`] || null));

    try {
      const res = await saveMosqueFacilities(payload);
      onSaved(res.facility);
      onClose();
    } catch (err) {
      const status = err.response?.status;
      setError(
        status === 401
          ? "Your session has expired. Please sign in again."
          : status === 422
          ? "Some of the information isn't valid. Please check the times and try again."
          : "We couldn't save your changes. Check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !dirty && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="facility-modal-title"
        className="theme-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-theme shadow-2xl max-h-[92vh] flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 border-b border-theme px-5 sm:px-6 py-4 shrink-0">
          <div>
            <h3 id="facility-modal-title" className="text-lg font-extrabold theme-text">
              {mosque.name}
            </h3>
            <p className="text-xs theme-muted mt-0.5">
              Help others by sharing what you know. It takes about 30 seconds.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="theme-icon-button theme-icon-button-sm">
            <RiCloseLine size={18} />
          </button>
        </div>

        {!user ? (
          <div className="px-5 sm:px-6 py-8 text-center space-y-4">
            <RiLockLine size={28} className="theme-gold mx-auto" />
            <div>
              <p className="text-base font-extrabold theme-text">Sign in to update this masjid</p>
              <p className="text-sm theme-muted mt-1">
                Updates from signed-in members keep the information trustworthy for everyone.
              </p>
            </div>
            <div className="flex justify-center gap-2.5">
              <button type="button" onClick={onClose} className="theme-button-outline px-4 py-2 rounded-xl text-sm font-bold">
                Not now
              </button>
              <Link to={loginPath} className="theme-button px-5 py-2 rounded-xl text-sm font-bold">
                Sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
            <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
              {error && (
                <div role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-500 font-semibold">
                  {error}
                </div>
              )}

              <section>
                <h4 className="text-sm font-extrabold theme-text">What does this masjid have?</h4>
                {!mosque.communityVerified && (
                  <p className="text-xs theme-muted mt-0.5">
                    These are pre-filled from map data. Please correct anything that's wrong.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  {FACILITIES.map((f) => {
                    const on = form[f.apiKey];
                    return (
                      <button
                        type="button"
                        key={f.key}
                        role="switch"
                        aria-checked={on}
                        onClick={() => toggle(f.apiKey)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold text-start transition-colors cursor-pointer ${
                          on ? "bg-accent-soft border-accent theme-accent" : "bg-theme-soft border-theme theme-muted"
                        }`}
                      >
                        <span aria-hidden="true" className="text-base">{f.emoji}</span>
                        <span className="flex-1">{f.label}</span>
                        <span className="font-bold">{on ? "Yes" : "No"}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <h4 className="flex items-center gap-1.5 text-sm font-extrabold theme-text">
                  <RiTimeLine size={16} className="theme-gold" />
                  <span>Jama'ah (iqamah) times</span>
                </h4>
                <p className="text-xs theme-muted mt-0.5">
                  This is when the congregation prayer starts. Leave a time empty if you're not sure.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {JAMAAH_FIELDS.filter((f) => f.key !== "jumuah" || form.has_jumuah).map((f) => {
                    const key = `${f.key}_jamaah`;
                    return (
                      <label key={f.key} className="block">
                        <span className="block text-xs font-semibold theme-secondary mb-1">{f.label}</span>
                        <span className="flex items-center gap-1">
                          <input
                            type="time"
                            value={form[key]}
                            onChange={(e) => setTime(key, e.target.value)}
                            className="theme-input text-sm flex-1 min-w-0"
                          />
                          {form[key] && (
                            <button
                              type="button"
                              onClick={() => setTime(key, "")}
                              aria-label={`Clear ${f.label} time`}
                              className="theme-icon-button theme-icon-button-sm"
                            >
                              <RiCloseLine size={14} />
                            </button>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="shrink-0 border-t border-theme px-5 sm:px-6 py-3 flex items-center justify-between gap-3">
              <p className="text-xs theme-muted hidden sm:block">
                {dirty ? "You have unsaved changes." : "Change anything that's wrong, then save."}
              </p>
              <div className="flex gap-2.5 ms-auto">
                <button type="button" onClick={onClose} className="theme-button-outline px-4 py-2 rounded-xl text-sm font-bold">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !dirty}
                  className="theme-button px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 disabled:opacity-60"
                >
                  <RiCheckDoubleLine size={16} />
                  <span>{saving ? "Saving..." : "Save changes"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FacilityUpdateModal;