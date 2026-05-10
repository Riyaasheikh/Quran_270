import React, { useEffect, useRef, useState } from "react";
import {
  RiCloseLine, RiSkipBackFill, RiSkipForwardFill,
  RiPlayFill, RiPauseFill, RiLoader4Line
} from "@remixicon/react";

const AudioPlayer = ({
  playlist,           // for ayah-by-ayah mode
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
      // Full chapter mode — single URL from API
      src = audioUrl;
    } else if (playlist?.[currentIndex]) {
      // Ayah-by-ayah mode — construct from verse_key
      const verseKey = playlist[currentIndex].verse_key;
      const [surah, ayah] = verseKey.split(':');
      src = `https://everyayah.com/data/Alafasy_128kbps/${surah.padStart(3,'0')}${ayah.padStart(3,'0')}.mp3`;
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
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-2xl z-[100]">

      {/* Progress bar */}
      <div
        className="w-full h-1 bg-gray-100 cursor-pointer"
        onClick={handleSeek}
      >
        <div
          className="h-1 bg-[#2ca4ab] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="px-4 py-3 md:px-10 flex items-center justify-between gap-4">

        {/* Left — surah + reciter */}
        <div className="hidden md:flex flex-col min-w-0 w-1/4">
          <span className="text-xs font-bold text-[#2ca4ab] uppercase tracking-widest truncate">
            {surahName} · {verseLabel}
          </span>
          <button
            onClick={onChangeReciter}
            className="text-sm font-semibold text-gray-700 hover:text-[#2ca4ab] transition-colors text-left truncate mt-0.5"
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
              className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30 transition-colors"
            >
              <RiSkipBackFill className="text-gray-600" size={22} />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-12 h-12 bg-[#2ca4ab] hover:bg-[#248a91] text-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95"
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
              className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30 transition-colors"
            >
              <RiSkipForwardFill className="text-gray-600" size={22} />
            </button>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
            <span>{formatTime(audioRef.current?.currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
            <span className="ml-1 text-gray-300">·</span>
            <span>{audioUrl ? 'Full Chapter' : isSingleVerseMode ? 'Single Verse' : 'Continuous'}</span>
          </div>
        </div>

        {/* Right — mobile reciter + close */}
        <div className="flex items-center gap-3 w-auto md:w-1/4 justify-end">
          <button
            onClick={onChangeReciter}
            className="md:hidden text-xs text-[#2ca4ab] font-semibold"
          >
            {reciterName?.split(' ')[0] || 'Reciter'} ›
          </button>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <RiCloseLine size={24} className="text-gray-500" />
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