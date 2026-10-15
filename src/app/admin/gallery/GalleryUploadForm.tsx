"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaUpload from "@/components/admin/MediaUpload";

type Room = { id: string; name: string };

export default function GalleryUploadForm({ rooms }: { rooms?: Room[] }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [roomId, setRoomId] = useState("");
  const [tagsInput, setTagsInput] = useState("");
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
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption || undefined,
          room_id: roomId || null,
          tags: tagsInput ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to add to gallery.");
        setStatus("error");
        return;
      }

      setImageUrl("");
      setCaption("");
      setRoomId("");
      setTagsInput("");
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

      {rooms && rooms.length > 0 && (
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-2">
            Room (optional)
          </label>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className={inputClass}>
            <option value="">No room assigned</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-2">
          Tags (optional, comma-separated)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="interior, stage, bar, event"
          maxLength={500}
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
