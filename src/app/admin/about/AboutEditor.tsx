"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AboutContent } from "@/lib/supabase";

export default function AboutEditor({ section }: { section: AboutContent }) {
  const router = useRouter();
  const [title, setTitle] = useState(section.title ?? "");
  const [content, setContent] = useState(section.content ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    setStatus("saving");
    const res = await fetch("/api/admin/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: section.id, title, content }),
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
    "w-full bg-[#0a0a0a] border border-club-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-club-gold/50 transition-colors";

  return (
    <div className="bg-club-card border border-club-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <code className="text-xs text-club-gold bg-club-gold/10 px-2 py-1 rounded">{section.section_key}</code>
        <button
          onClick={handleSave}
          disabled={status === "saving"}
          className="text-xs px-4 py-1.5 bg-club-red text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {status === "saving" ? "Saving..." : status === "saved" ? "Saved ✓" : "Save"}
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
      </div>
      {status === "error" && <p className="text-club-red text-xs mt-2">Failed to save.</p>}
    </div>
  );
}
