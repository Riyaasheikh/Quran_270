import React, { useRef, useState, useEffect } from "react";
import {
  RiCloseLine, RiSkipBackFill, RiSkipForwardFill,
  RiPlayFill, RiPauseFill, RiLoader4Line
} from "@remixicon/react";

const AudioPlayer = ({
  playlist,           // array of audio objects/verses
  audioUrl,           // for full chapter mode (single URL)
  currentIndex,
  onNext,
  onPrevious,
  onClose,
  surahName,
  reciterName,
  onChangeReciter,
  isSingleVerseMode = false,
}) => {
  const audioRef    = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [duration,  setDuration]  = useState(0);
  const [buffering, setBuffering] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let src;

  if (audioUrl) {
      src = audioUrl;
    } else if (playlist?.[currentIndex]) {
      const currentAudioItem = playlist[currentIndex];
      // Supports both .url or .audio_url properties returned by Quran API
      src = currentAudioItem.url || currentAudioItem.audio_url;
    } else return;
   

    setBuffering(true);
    audio.pause();
    audio.src = src;
    audio.load();

    const onCanPlay = () => {
      setBuffering(false);
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(e => { if (e.name !== 'AbortError') console.error(e); });
    };

    audio.addEventListener('canplay', onCanPlay);
    return () => audio.removeEventListener('canplay', onCanPlay);
  }, [currentIndex, playlist, audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio.paused) { audio.play(); setIsPlaying(true); }
    else              { audio.pause(); setIsPlaying(false); }
  };

  const handleEnded = () => {
    if (isSingleVerseMode || audioUrl) {
      setIsPlaying(false);
    } else {
      onNext();
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
      setDuration(audio.duration);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const rect  = e.currentTarget.getBoundingClientRect();
    const pct   = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  if (!playlist?.length && !audioUrl) return null;

  const verseLabel = audioUrl
    ? 'Full Surah'
    : playlist[currentIndex]?.verse_key;

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
            {surahName} · {verseLabel}
          </span>
          <button
            onClick={onChangeReciter}
            className="text-sm font-semibold theme-text hover:theme-accent transition-colors text-left truncate mt-0.5 cursor-pointer"
          >
            {reciterName || 'Select Reciter'} ›
          </button>
        </div>

        {/* Center — controls */}
        <div className="flex flex-col items-center gap-1.5 flex-1 md:w-1/2">
          <div className="flex items-center gap-5">
            <button
              onClick={onPrevious}
              disabled={isSingleVerseMode || !!audioUrl}
              className="p-2 theme-button-ghost rounded-full disabled:opacity-30 transition-colors cursor-pointer"
            >
              <RiSkipBackFill className="theme-text" size={22} />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-12 h-12 bg-accent hover:opacity-90 text-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {buffering
                ? <RiLoader4Line size={22} className="animate-spin" />
                : isPlaying
                  ? <RiPauseFill size={26} />
                  : <RiPlayFill size={26} />
              }
            </button>

            <button
              onClick={onNext}
              disabled={isSingleVerseMode || !!audioUrl}
              className="p-2 theme-button-ghost rounded-full disabled:opacity-30 transition-colors cursor-pointer"
            >
              <RiSkipForwardFill className="theme-text" size={22} />
            </button>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-[10px] theme-muted font-mono">
            <span>{formatTime(audioRef.current?.currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
            <span className="ml-1 theme-subtle">·</span>
            <span>{audioUrl ? 'Full Chapter' : isSingleVerseMode ? 'Single Verse' : 'Continuous'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-auto md:w-1/4 justify-end">
          <button
            onClick={onChangeReciter}
            className="md:hidden text-xs theme-accent font-semibold cursor-pointer"
          >
            {reciterName?.split(' ')[0] || 'Reciter'} ›
          </button>
          <button onClick={onClose} className="p-2 theme-button-ghost rounded-full cursor-pointer">
            <RiCloseLine size={24} className="theme-muted" />
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
      />
    </div>
  );
};

export default AudioPlayer;