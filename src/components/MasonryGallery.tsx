"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
};

export default function MasonryGallery({ images }: { images: GalleryImage[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goNext = useCallback(() => {
    setLightboxIdx((prev) => prev === null ? null : (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setLightboxIdx((prev) => prev === null ? null : (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIdx !== null) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [lightboxIdx]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (lightboxIdx === null) return;
    if (e.key === "Escape") setLightboxIdx(null);
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  }

  return (
    <>
      <div className="columns-2 sm:columns-3 gap-3 space-y-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setLightboxIdx(i)}
            className="block w-full break-inside-avoid overflow-hidden group relative bg-off-white-2 dark:bg-[#161412] border-0 p-0 cursor-pointer"
          >
            <Image
              src={img.image_url}
              alt={img.caption || "Gallery image"}
              width={600}
              height={400}
              className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            {img.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white text-left">{img.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          tabIndex={0}
          role="dialog"
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl z-10 w-10 h-10 flex items-center justify-center"
            aria-label="Close"
          >
            &times;
          </button>

          {/* Prev/Next — hidden on mobile (use swipe instead) */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-3xl z-10 hidden sm:block"
            aria-label="Previous"
          >
            &#8249;
          </button>

          <div className="max-w-4xl max-h-[85vh] px-4 sm:px-0 relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightboxIdx].image_url}
              alt={images[lightboxIdx].caption || "Gallery image"}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto h-auto object-contain mx-auto"
              sizes="90vw"
              priority
            />
            {images[lightboxIdx].caption && (
              <p className="text-center text-sm text-white/70 mt-3">
                {images[lightboxIdx].caption}
              </p>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-3xl z-10 hidden sm:block"
            aria-label="Next"
          >
            &#8250;
          </button>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/40">
            {lightboxIdx + 1} / {images.length} {" "}
            <span className="sm:hidden">&#8212; Swipe to navigate</span>
          </p>
        </div>
      )}
    </>
  );
}
