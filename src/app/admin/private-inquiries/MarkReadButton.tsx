"use client";

import { useRouter } from "next/navigation";

export default function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();

  async function markRead() {
    await fetch(`/api/admin/private-inquiries/${id}/read`, { method: "PUT" });
    router.refresh();
  }

  return (
    <button
      onClick={markRead}
      className="text-xs px-3 py-1.5 border border-charcoal/10 text-muted hover:border-gold/30 hover:text-charcoal transition-colors flex-shrink-0"
    >
      Mark Read
    </button>
  );
}
