"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markRead() {
    setLoading(true);
    await fetch(`/api/admin/messages/${id}/read`, { method: "POST" });
    router.refresh();
  }

  return (
    <button
      onClick={markRead}
      disabled={loading}
      className="flex-shrink-0 text-xs px-3 py-1.5 border border-club-gold/30 text-club-gold rounded hover:bg-club-gold/10 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Mark Read"}
    </button>
  );
}
