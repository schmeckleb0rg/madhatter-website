"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteMessageButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this message?")) return;
    setLoading(true);
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex-shrink-0 text-xs px-3 py-1.5 border border-charcoal/10 text-muted hover:border-charcoal/30 hover:text-charcoal transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}
