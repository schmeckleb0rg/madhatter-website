"use client";

import { useCallback, useRef } from "react";

type SpotlightCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function SpotlightCard({ children, className = "" }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group/spotlight ${className}`}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 z-[3] opacity-0 group-hover/spotlight:opacity-100 transition-opacity duration-500"
        style={{
          background: "radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(184, 147, 74, 0.06), transparent 60%)",
        }}
      />
    </div>
  );
}
