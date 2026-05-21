import { useEffect, useRef, useState } from "react";
import "./musicplayer.css";

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [started, setStarted] = useState(false);
  const [open, setOpen] = useState(false);

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

  const toggleMute = (e) => {
    e.stopPropagation();
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
    if (audioRef.current) audioRef.current.volume = val / 100;
    if (val === 0) {
      setMuted(true);
      if (audioRef.current) audioRef.current.muted = true;
    } else if (muted) {
      setMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  };

  const isMuted = muted || volume === 0;

  return (
    <>
      <audio ref={audioRef} src="/music/background.mp3" loop preload="auto" />

      <div className="music-widget">
        {/* Popover panel — shown when open */}
        {open && (
          <div className="music-panel">
            {/* Mute toggle */}
            <button
              className={`music-mute-btn ${isMuted ? "music-mute-btn--muted" : ""}`}
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>

            {/* Divider */}
            <div className="music-panel-divider" />

            {/* Volume slider */}
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={isMuted ? 0 : volume}
              onChange={handleVolume}
              className="music-slider"
              aria-label="Volume"
            />
            <span className="music-panel-value">{isMuted ? 0 : volume}%</span>
          </div>
        )}

        {/* Single toggle button */}
        <button
          className={`music-toggle ${isMuted ? "music-toggle--muted" : ""} ${open ? "music-toggle--active" : ""}`}
          onClick={() => setOpen((s) => !s)}
          aria-label="Music controls"
          title="Music controls"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </button>
      </div>
    </>
  );
}