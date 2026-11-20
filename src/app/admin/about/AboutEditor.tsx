"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AboutContent } from "@/lib/supabase";
import MediaUpload from "@/components/admin/MediaUpload";

export default function AboutEditor({ section }: { section: AboutContent }) {
  const router = useRouter();
  const [title, setTitle] = useState(section.title ?? "");
  const [content, setContent] = useState(section.content ?? "");
  const [imageUrl, setImageUrl] = useState(section.image_url ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    setStatus("saving");
    const res = await fetch("/api/admin/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: section.id, title, content, image_url: imageUrl || null }),
    });

    if (res.ok) {
      setStatus("saved");
      router.refresh();
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";

  return (
    <div className="bg-white border border-charcoal/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <code className="text-xs text-gold bg-gold/10 px-2 py-1">{section.section_key}</code>
        <button
          onClick={handleSave}
          disabled={status === "saving"}
          className="text-xs px-4 py-1.5 bg-charcoal text-off-white hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
        >
          {status === "saving" ? "Saving..." : status === "saved" ? "Saved" : "Save"}
        </button>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Section title"
        />
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`${inputClass} resize-none`}
          placeholder="Section content"
        />
        <MediaUpload
          value={imageUrl}
          onChange={setImageUrl}
          folder="about"
          hint="Recommended: 900 × 900 px square · PNG or JPEG · Max 100 MB"
          label="Section Image"
        />
      </div>
      {status === "error" && <p className="text-xs mt-2" style={{ color: "#9C4A38" }}>Failed to save.</p>}
    </div>
  );
}
