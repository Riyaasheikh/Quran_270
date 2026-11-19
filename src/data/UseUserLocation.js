import { useCallback, useEffect, useRef, useState } from "react";
import { getDistanceKm } from "../api/mosqueApi";

const DEFAULT_LOCATION = { lat: 31.5204, lon: 74.3587, label: "Lahore" };
const MIN_MOVE_KM = 0.08; // ignore GPS jitter under ~80 m so we don't re-scan constantly

/**
 * status:
 *  acquiring - waiting for GPS
 *  active    - live GPS in use
 *  manual    - the person searched for a place
 *  denied    - permission blocked, showing default city
 *  fallback  - GPS unavailable/timed out, showing default city
 */
export default function useUserLocation() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("acquiring");
  const [label, setLabel] = useState("");

  const watchId = useRef(null);
  const modeRef = useRef("live"); // live | manual
  const sourceRef = useRef(null); // live | manual | default
  const coordsRef = useRef(null);

  const stopWatching = useCallback(() => {
    if (watchId.current !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    watchId.current = null;
  }, []);

  const apply = useCallback((next, source, nextStatus, nextLabel = "") => {
    coordsRef.current = next;
    sourceRef.current = source;
    setCoords(next);
    setStatus(nextStatus);
    setLabel(nextLabel);
  }, []);

  const useDefault = useCallback(
    (nextStatus) =>
      apply(
        { lat: DEFAULT_LOCATION.lat, lon: DEFAULT_LOCATION.lon },
        "default",
        nextStatus,
        DEFAULT_LOCATION.label
      ),
    [apply]
  );

  const startLive = useCallback(() => {
    stopWatching();
    modeRef.current = "live";

    if (!("geolocation" in navigator)) {
      useDefault("fallback");
      return;
    }

    setStatus("acquiring");

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (modeRef.current !== "live") return;
        const next = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        const prev = coordsRef.current;
        const movedEnough =
          !prev ||
          sourceRef.current !== "live" ||
          getDistanceKm(prev.lat, prev.lon, next.lat, next.lon) > MIN_MOVE_KM;

        if (movedEnough) {
          apply(next, "live", "active");
        } else {
          setStatus("active");
        }
      },
      (err) => {
        if (modeRef.current !== "live") return;
        // Keep a real GPS fix if we already have one; otherwise fall back to the default city
        if (sourceRef.current !== "live") useDefault(err.code === 1 ? "denied" : "fallback");
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 }
    );
  }, [apply, stopWatching, useDefault]);

  const setManualLocation = useCallback(
    (place) => {
      stopWatching();
      modeRef.current = "manual";
      apply({ lat: place.lat, lon: place.lon }, "manual", "manual", place.label);
    },
    [apply, stopWatching]
  );

  useEffect(() => {
    startLive();
    return stopWatching;
  }, [startLive, stopWatching]);

  return { coords, status, label, retry: startLive, setManualLocation };
}