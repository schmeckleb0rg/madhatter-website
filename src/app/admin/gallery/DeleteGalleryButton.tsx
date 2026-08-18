"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteGalleryButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this image?")) return;
    setLoading(true);
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-muted hover:text-charcoal transition-colors disabled:opacity-50 flex-shrink-0"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}
