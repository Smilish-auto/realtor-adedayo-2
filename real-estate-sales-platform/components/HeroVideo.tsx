"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { VideoSlide } from "@/core/types";

const ytId = (url: string) => url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)?.[1] || null;

/** Full-bleed hero background: 2–3 videos (MP4/WebM/YouTube) that crossfade. Posters show instantly and act as fallback. */
export default function HeroVideo({ slides, index, onIndex, seconds }: { slides: VideoSlide[]; index: number; onIndex: (i: number) => void; seconds: number }) {
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const [paused, setPaused] = useState(false);
  const refs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true); }, []);
  useEffect(() => { setVisited((v) => (v.has(index) ? v : new Set(v).add(index))); }, [index]);
  useEffect(() => {
    slides.forEach((s, i) => { const v = refs.current[s.id]; if (!v) return; if (i === index && !paused) v.play().catch(() => {}); else v.pause(); });
  }, [index, slides, visited, ready, paused]);
  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(() => { if (!document.hidden) onIndex((index + 1) % slides.length); }, seconds * 1000);
    return () => clearInterval(t);
  }, [paused, index, slides.length, seconds, onIndex]);

  if (!slides.length) return null;
  return (
    <>
      <div className="hero-media" aria-hidden="true">
        {slides.map((s, i) => {
          const yt = ytId(s.videoUrl); const direct = !!s.videoUrl && !yt; const active = i === index;
          return (
            <div key={s.id} className={`hero-slide ${active ? "is-active" : ""}`}>
              {s.poster && <img src={s.poster} alt="" className="hero-poster" loading={i === 0 ? "eager" : "lazy"} decoding="async" />}
              {direct && visited.has(i) && (
                <video ref={(el) => { refs.current[s.id] = el; }} className={`hero-video ${ready[s.id] ? "is-ready" : ""}`} src={s.videoUrl} poster={s.poster || undefined}
                  muted loop playsInline preload="auto" disablePictureInPicture onCanPlay={() => setReady((r) => (r[s.id] ? r : { ...r, [s.id]: true }))} />
              )}
              {yt && active && !paused && (
                <iframe className="hero-video is-ready hero-yt" title={s.title || "Video"} tabIndex={-1} allow="autoplay; encrypted-media" loading="lazy"
                  src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&controls=0&loop=1&playlist=${yt}&playsinline=1&modestbranding=1&rel=0`} />
              )}
            </div>
          );
        })}
        <div className="hero-shade" />
      </div>
      <div className="hero-controls">
        {slides.length > 1 && slides.map((s, i) => (
          <button key={s.id} className={`hero-dot ${i === index ? "is-active" : ""}`} onClick={() => onIndex(i)} aria-label={`Show slide ${i + 1}: ${s.title}`} aria-current={i === index}>
            <span style={i === index && !paused ? { animationDuration: `${seconds}s` } : undefined} />
          </button>
        ))}
        <button className="hero-pause" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play background video" : "Pause background video"}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>
      </div>
    </>
  );
}
