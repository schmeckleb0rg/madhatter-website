"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

type Slide = {
  image_url: string;
  caption: string | null;
};

type MediaSlideshowProps = {
  slides: Slide[];
  speed?: number; // seconds between transitions
};

export default function MediaSlideshow({ slides, speed = 5 }: MediaSlideshowProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, speed * 1000);
    return () => clearInterval(timer);
  }, [next, speed, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-off-white-2 dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10">
      {/* Slides — taller ratio on mobile for better viewing */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/7]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Image
              src={slide.image_url}
              alt={slide.caption || `Slide ${i + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
            {slide.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 sm:p-6">
                <p className="text-off-white text-xs sm:text-sm font-medium">{slide.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Swipe-friendly navigation dots — larger on touch */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-gold w-6 sm:w-6" : "w-2 bg-off-white/50 dark:bg-[#7A7264]/50 hover:bg-off-white/80"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
