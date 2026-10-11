"use client";
import { useEffect, useRef, useState } from "react";

/** Lazy 3D reveal: element flies/rotates into place the first time it scrolls into view. */
export default function Reveal({ children, className = "", delay = 0, variant = "up" }: {
  children: React.ReactNode; className?: string; delay?: number; variant?: "up" | "left" | "right" | "flip";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`r3d r3d-${variant} ${on ? "is-in" : ""} ${className}`} style={{ transitionDelay: on ? `${delay}ms` : "0ms" }}>{children}</div>;
}
