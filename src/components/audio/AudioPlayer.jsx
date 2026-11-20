import React, { useRef, useState, useEffect } from "react";
import {
  RiCloseLine,
  RiSkipBackFill,
  RiSkipForwardFill,
  RiPlayFill,
  RiPauseFill,
  RiLoader4Line,
} from "@remixicon/react";

const AudioPlayer = ({
  playlist,
  audioUrl,
  currentIndex = 0,
  onNext,
  onPrevious,
  onClose,
  surahName,
  reciterName,
  onChangeReciter,
  isSingleVerseMode = false,
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let src = null;
    if (audioUrl) {
      src = audioUrl;
    } else if (Array.isArray(playlist) && playlist[currentIndex]) {
      const item = playlist[currentIndex];
      src = item.url || item.audio_url || null;
    }

    if (!src) {
      setIsPlaying(false);
      setBuffering(false);
      setErrorMsg("Audio source unavailable");
      return;
    }

    let cancelled = false;
    setErrorMsg("");
    setBuffering(true);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    audio.pause();
    audio.src = src;
    audio.load();

    const onCanPlay = () => {
      if (cancelled) return;
      setBuffering(false);
      audio
        .play()
        .then(() => {
          if (!cancelled) setIsPlaying(true);
        })
        .catch((e) => {
          if (e.name !== "AbortError") {
            console.error("Playback error:", e);
            if (!cancelled) {
              setIsPlaying(false);
              setErrorMsg("Tap play to start audio");
            }
          }
        });
    };

    const onAudioError = () => {
      if (cancelled) return;
      setBuffering(false);
      setIsPlaying(false);
      setErrorMsg("Failed to load audio stream");
    };

    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onAudioError);

    return () => {
      cancelled = true;
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onAudioError);
    };
  }, [currentIndex, playlist, audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (audio.paused) {
      setErrorMsg("");
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          if (e.name !== "AbortError") {
            console.error(e);
            setErrorMsg("Unable to play audio");
          }
        });
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    if (isSingleVerseMode || audioUrl) {
      setIsPlaying(false);
    } else if (typeof onNext === "function") {
      onNext();
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime || 0);
    if (audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || isNaN(audio.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = pct * audio.duration;
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  };

  if (!playlist?.length && !audioUrl) return null;

  const verseLabel = audioUrl
    ? "Full Surah"
    : playlist[currentIndex]?.verse_key || "";

  return (
    <div className="fixed bottom-0 left-0 w-full theme-card border-t border-theme shadow-2xl z-[100]">
      {/* Progress bar */}
      <div
        className="w-full h-1 bg-theme-soft cursor-pointer"
        onClick={handleSeek}
      >
        <div
          className="h-1 bg-accent transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="px-4 py-3 md:px-10 flex items-center justify-between gap-4">
        {/* Left — surah + reciter */}
        <div className="hidden md:flex flex-col min-w-0 w-1/4">
          <span className="text-xs font-bold theme-accent uppercase tracking-widest truncate">
            {surahName} {verseLabel ? `· ${verseLabel}` : ""}
          </span>
          <button
            type="button"
            onClick={onChangeReciter}
            className="text-sm font-semibold theme-text hover:theme-accent transition-colors text-left truncate mt-0.5 cursor-pointer"
          >
            {reciterName || "Select Reciter"} ›
          </button>
        </div>

        {/* Center — controls */}
        <div className="flex flex-col items-center gap-1.5 flex-1 md:w-1/2">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={onPrevious}
              disabled={isSingleVerseMode || !!audioUrl || (playlist?.length || 0) <= 1}
              className="p-2 theme-button-ghost rounded-full disabled:opacity-30 transition-colors cursor-pointer"
            >
              <RiSkipBackFill className="theme-text" size={22} />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              className="w-12 h-12 bg-accent hover:opacity-90 text-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {buffering ? (
                <RiLoader4Line size={22} className="animate-spin" />
              ) : isPlaying ? (
                <RiPauseFill size={26} />
              ) : (
                <RiPlayFill size={26} />
              )}
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={isSingleVerseMode || !!audioUrl || (playlist?.length || 0) <= 1}
              className="p-2 theme-button-ghost rounded-full disabled:opacity-30 transition-colors cursor-pointer"
            >
              <RiSkipForwardFill className="theme-text" size={22} />
            </button>
          </div>

          {/* Time / status */}
          <div className="flex items-center gap-2 text-[10px] theme-muted font-mono">
            {errorMsg ? (
              <span className="text-red-500 font-sans">{errorMsg}</span>
            ) : (
              <>
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
                <span className="ml-1 theme-subtle">·</span>
                <span>
                  {audioUrl
                    ? "Full Chapter"
                    : isSingleVerseMode
                    ? "Single Verse"
                    : "Continuous"}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-auto md:w-1/4 justify-end">
          <button
            type="button"
            onClick={onChangeReciter}
            className="md:hidden text-xs theme-accent font-semibold cursor-pointer"
          >
            {reciterName?.split(" ")[0] || "Reciter"} ›
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 theme-button-ghost rounded-full cursor-pointer"
          >
            <RiCloseLine size={24} className="theme-muted" />
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        preload="metadata"
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
      />
    </div>
  );
};

export default AudioPlayer;