"use client";

import { useRef, useEffect, useState } from "react";

type TypewriterTextProps = {
  text: string;
  delay?: number;
  className?: string;
};

export default function TypewriterText({
  text,
  delay = 0,
  className = "",
}: TypewriterTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className={`${
        inView ? "animate-typewriter animate-typewriter-done" : ""
      } ${className}`}
      style={inView ? { animationDelay: `${delay}ms, ${delay}ms` } : undefined}
    >
      {text}
    </span>
  );
}
