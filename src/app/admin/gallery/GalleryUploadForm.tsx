"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export default function GalleryUploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setStatus("loading");
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);

    const res = await fetch("/api/admin/gallery", { method: "POST", body: formData });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Upload failed");
      setStatus("error");
      return;
    }

    setCaption("");
    if (fileRef.current) fileRef.current.value = "";
    setStatus("idle");
    router.refresh();
  }

  const inputClass =
    "w-full bg-club-bg border border-club-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-club-gold/50 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        required
        className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-club-border file:text-sm file:font-semibold file:bg-club-card file:text-gray-300 hover:file:bg-club-border file:cursor-pointer file:transition-colors"
      />
      <input
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption (optional)"
        maxLength={200}
        className={inputClass}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-6 py-3 bg-club-red text-white text-sm font-semibold rounded hover:bg-red-700 disabled:opacity-50 transition-colors flex-shrink-0"
      >
        {status === "loading" ? "Uploading..." : "Upload"}
      </button>
      {error && <p className="text-club-red text-sm self-center">{error}</p>}
    </form>
  );
}
