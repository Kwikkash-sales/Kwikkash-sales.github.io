import { useEffect, useRef, useState } from "react";
import "./musicplayer.css";

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [started, setStarted] = useState(false);
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;

    const tryPlay = () => {
      audio.play().then(() => setStarted(true)).catch(() => {});
    };

    tryPlay();

    const onInteraction = () => {
      if (!started) {
        tryPlay();
        window.removeEventListener("click", onInteraction);
        window.removeEventListener("keydown", onInteraction);
      }
    };

    window.addEventListener("click", onInteraction);
    window.addEventListener("keydown", onInteraction);

    return () => {
      window.removeEventListener("click", onInteraction);
      window.removeEventListener("keydown", onInteraction);
    };
  }, [started]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!started) {
      audio.play().then(() => setStarted(true)).catch(() => {});
    }
    const next = !muted;
    audio.muted = next;
    setMuted(next);
  };

  const handleVolume = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
    }
    if (val === 0) {
      setMuted(true);
      if (audioRef.current) audioRef.current.muted = true;
    } else if (muted) {
      setMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  };

  const volumeIcon = () => {
    if (muted || volume === 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      );
    }
    if (volume < 50) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    );
  };

  return (
    <>
      <audio ref={audioRef} src="/music/background.mp3" loop preload="auto" />

      <div className="music-widget">
        {showSlider && (
          <div className="music-slider-panel">
            <span className="music-slider__label">Volume</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={muted ? 0 : volume}
              onChange={handleVolume}
              className="music-slider"
              aria-label="Volume"
            />
            <span className="music-slider__value">{muted ? 0 : volume}%</span>
          </div>
        )}

        <div className="music-controls">
          <button
            className="music-slider-toggle"
            onClick={() => setShowSlider((s) => !s)}
            aria-label="Toggle volume slider"
            title="Adjust volume"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>

          <button
            className={`music-btn ${muted || volume === 0 ? "music-btn--muted" : ""}`}
            onClick={toggleMute}
            aria-label={muted ? "Unmute background music" : "Mute background music"}
            title={muted ? "Unmute music" : "Mute music"}
          >
            {volumeIcon()}
            <span className="music-btn__label">{muted || volume === 0 ? "Unmute" : "Mute"}</span>
          </button>
        </div>
      </div>
    </>
  );
}