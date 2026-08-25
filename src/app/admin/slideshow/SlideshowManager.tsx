"use client";

import { useState, useRef } from "react";
import type { EventSlideshow } from "@/lib/supabase";

export default function SlideshowManager({
  initialSlides,
  initialSpeed,
}: {
  initialSlides: EventSlideshow[];
  initialSpeed: string;
}) {
  const [slides, setSlides] = useState<EventSlideshow[]>(initialSlides);
  const [uploading, setUploading] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const [speedStatus, setSpeedStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const inputClass =
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";

  const [uploadError, setUploadError] = useState("");

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/slideshow", { method: "POST", body: fd });
      if (res.ok) {
        const slide = await res.json();
        setSlides((prev) => [...prev, slide]);
      } else {
        const data = await res.json();
        setUploadError(data.error ?? "Upload failed.");
      }
    } catch {
      setUploadError("Connection error. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this slideshow image?")) return;
    const res = await fetch(`/api/admin/slideshow/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSlides((prev) => prev.filter((s) => s.id !== id));
    }
  }

  async function handleUpdateSort(id: string, newOrder: number) {
    const res = await fetch(`/api/admin/slideshow/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sort_order: newOrder }),
    });
    if (res.ok) {
      setSlides((prev) =>
        prev
          .map((s) => (s.id === id ? { ...s, sort_order: newOrder } : s))
          .sort((a, b) => a.sort_order - b.sort_order)
      );
    }
  }

  async function handleUpdateCaption(id: string, caption: string) {
    await fetch(`/api/admin/slideshow/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: caption || null }),
    });
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, caption } : s))
    );
  }

  async function saveSpeed() {
    setSpeedStatus("saving");
    const res = await fetch("/api/admin/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slideshow_speed: speed }),
    });
    setSpeedStatus(res.ok ? "saved" : "error");
    if (res.ok) setTimeout(() => setSpeedStatus("idle"), 2000);
  }

  function moveUp(index: number) {
    if (index <= 0) return;
    const slide = slides[index];
    const prevSlide = slides[index - 1];
    handleUpdateSort(slide.id, prevSlide.sort_order);
    handleUpdateSort(prevSlide.id, slide.sort_order);
  }

  function moveDown(index: number) {
    if (index >= slides.length - 1) return;
    const slide = slides[index];
    const nextSlide = slides[index + 1];
    handleUpdateSort(slide.id, nextSlide.sort_order);
    handleUpdateSort(nextSlide.id, slide.sort_order);
  }

  return (
    <div className="space-y-6">
      {/* Speed setting */}
      <div className="bg-white border border-charcoal/10 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-charcoal">Slideshow Speed</h2>
            <p className="text-xs text-muted mt-0.5">Time in milliseconds between slides (e.g., 5000 = 5 seconds).</p>
          </div>
          <button
            onClick={saveSpeed}
            disabled={speedStatus === "saving"}
            className="text-xs px-4 py-1.5 bg-charcoal text-off-white hover:bg-charcoal-2 disabled:opacity-50 transition-colors w-full sm:w-auto"
          >
            {speedStatus === "saving" ? "Saving..." : speedStatus === "saved" ? "Saved" : "Save"}
          </button>
        </div>
        <input
          type="number"
          min="1000"
          step="500"
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
          className={`${inputClass} max-w-xs`}
          placeholder="5000"
        />
        {speedStatus === "error" && <p className="text-xs mt-2" style={{ color: "#9C4A38" }}>Failed to save.</p>}
      </div>

      {/* Upload */}
      <div className="bg-white border border-charcoal/10 p-4 sm:p-6">
        <h2 className="text-base font-bold text-charcoal mb-1">Upload New Slide</h2>
        <p className="font-mono text-[10px] uppercase tracking-wide text-muted/70 mb-4">
          Recommended: 1920 × 1080 px · PNG, JPEG, GIF, or MOV · Max 100 MB
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,.mov,video/quicktime,video/mp4"
          onChange={handleUpload}
          className="text-sm text-muted file:mr-4 file:py-2 file:px-4 file:border file:border-charcoal/10 file:text-sm file:font-semibold file:bg-off-white-2 file:text-charcoal hover:file:bg-charcoal/5 file:cursor-pointer file:transition-colors"
        />
        {uploading && <p className="text-xs text-gold mt-2">Uploading...</p>}
        {uploadError && <p className="text-xs mt-2" style={{ color: "#9C4A38" }}>{uploadError}</p>}
      </div>

      {/* Current slides */}
      <div className="bg-white border border-charcoal/10 p-4 sm:p-6">
        <h2 className="text-base font-bold text-charcoal mb-4">
          Current Slides ({slides.length})
        </h2>
        {slides.length === 0 ? (
          <p className="text-sm text-muted">No slideshow images yet. Upload one above.</p>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <div key={slide.id} className="flex flex-col sm:flex-row gap-3 sm:gap-4 border border-charcoal/10 p-3 sm:p-4">
                <div className="w-full sm:w-32 h-32 sm:h-20 flex-shrink-0 overflow-hidden border border-charcoal/10 bg-off-white">
                  {/\.(mov|mp4)(\?|$)/i.test(slide.image_url) ? (
                    <video src={slide.image_url} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={slide.image_url} alt={slide.caption || "Slide"} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={slide.caption ?? ""}
                    onChange={(e) => {
                      setSlides((prev) =>
                        prev.map((s) => (s.id === slide.id ? { ...s, caption: e.target.value } : s))
                      );
                    }}
                    onBlur={(e) => handleUpdateCaption(slide.id, e.target.value)}
                    className={`${inputClass} text-xs`}
                    placeholder="Caption (optional)"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">Order: {slide.sort_order}</span>
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="text-xs px-2 py-1 border border-charcoal/10 text-muted hover:text-charcoal disabled:opacity-30 transition-colors"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === slides.length - 1}
                      className="text-xs px-2 py-1 border border-charcoal/10 text-muted hover:text-charcoal disabled:opacity-30 transition-colors"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(slide.id)}
                      className="text-xs px-2 py-1 border border-red-200 text-red-500 hover:text-red-700 transition-colors ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
