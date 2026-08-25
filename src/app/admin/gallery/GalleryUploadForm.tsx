"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaUpload from "@/components/admin/MediaUpload";

export default function GalleryUploadForm() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  const inputClass =
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";

  async function handleAdd() {
    if (!imageUrl) return;
    setStatus("saving");
    setError("");

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl, caption: caption || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to add to gallery.");
        setStatus("error");
        return;
      }

      setImageUrl("");
      setCaption("");
      setStatus("idle");
      router.refresh();
    } catch {
      setError("Connection error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-5">
      <MediaUpload
        label="Gallery Image or Video"
        value={imageUrl}
        onChange={setImageUrl}
        folder="gallery"
        hint="Recommended: 1200 × 800 px · PNG, JPEG, GIF, or MOV · Max 100 MB"
      />

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-2">
          Caption (optional)
        </label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption..."
          maxLength={200}
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm" style={{ color: "#9C4A38" }}>{error}</p>}

      <button
        type="button"
        onClick={handleAdd}
        disabled={!imageUrl || status === "saving"}
        className="w-full py-3 bg-charcoal text-off-white text-sm font-semibold hover:bg-charcoal-2 disabled:opacity-40 transition-colors"
      >
        {status === "saving" ? "Adding..." : "Add to Gallery"}
      </button>
    </div>
  );
}
