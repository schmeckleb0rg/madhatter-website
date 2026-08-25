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
    <div className="relative overflow-hidden bg-off-white-2 border border-charcoal/10">
      {/* Slides */}
      <div className="relative aspect-[16/7]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0"
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
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <p className="text-off-white text-sm font-medium">{slide.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-gold w-6" : "bg-off-white/50 hover:bg-off-white/80"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
