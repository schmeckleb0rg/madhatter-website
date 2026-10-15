"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GiftCard } from "@/lib/supabase";

type GiftCardsAdminProps = {
  initialCards: GiftCard[];
};

export default function GiftCardsAdmin({ initialCards }: GiftCardsAdminProps) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "voided">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    amount: "",
    recipient_email: "",
    recipient_name: "",
    issued_by_name: "",
    message: "",
  });
  const [createStatus, setCreateStatus] = useState<"idle" | "loading" | "error">("idle");
  const [createError, setCreateError] = useState("");

  const filtered = cards.filter((c) => {
    if (filter === "active") return c.is_active && !c.is_voided;
    if (filter === "pending") return !c.is_active && !c.is_voided;
    if (filter === "voided") return c.is_voided;
    return true;
  }).filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.code.toLowerCase().includes(s) ||
      c.recipient_email?.toLowerCase().includes(s) ||
      c.issued_to_email?.toLowerCase().includes(s);
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateStatus("loading");
    setCreateError("");

    const amountCents = Math.round(parseFloat(createForm.amount) * 100);
    if (!amountCents || amountCents < 100) {
      setCreateError("Amount must be at least $1.00");
      setCreateStatus("error");
      return;
    }

    const res = await fetch("/api/admin/gift-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount_cents: amountCents,
        recipient_email: createForm.recipient_email,
        recipient_name: createForm.recipient_name || undefined,
        issued_by_name: createForm.issued_by_name || undefined,
        message: createForm.message || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setCreateError(data.error ?? "Failed to create");
      setCreateStatus("error");
      return;
    }

    const newCard = await res.json();
    setCards([newCard, ...cards]);
    setShowCreate(false);
    setCreateForm({ amount: "", recipient_email: "", recipient_name: "", issued_by_name: "", message: "" });
    setCreateStatus("idle");
  }

  async function voidCard(id: string) {
    if (!confirm("Void this gift card? Remaining balance will be zeroed out.")) return;
    await fetch(`/api/admin/gift-cards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_voided: true }),
    });
    router.refresh();
    setCards(cards.map((c) => c.id === id ? { ...c, is_voided: true, balance_cents: 0 } : c));
  }

  function getStatusBadge(card: GiftCard) {
    if (card.is_voided) return <span className="font-mono text-xs px-2 py-0.5 bg-red-50 text-red-600">Voided</span>;
    if (!card.is_active) return <span className="font-mono text-xs px-2 py-0.5 bg-amber-50 text-amber-600">Pending</span>;
    if (card.balance_cents === 0) return <span className="font-mono text-xs px-2 py-0.5 bg-gray-100 text-gray-500">Used</span>;
    return <span className="font-mono text-xs px-2 py-0.5 bg-green-50 text-green-700">Active</span>;
  }

  const inputClass = "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass = "block font-mono text-xs uppercase tracking-widest text-muted mb-2";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 sm:mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-charcoal">Gift Cards</h1>
          <p className="text-sm text-muted mt-1">{cards.length} total</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-charcoal text-off-white text-sm font-semibold hover:bg-charcoal-2 transition-colors"
        >
          + Issue Gift Card
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border border-charcoal/10 p-5 mb-6 space-y-4">
          <div className="font-mono text-xs uppercase tracking-widest text-gold">Manual Issue (Box Office)</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Amount ($) *</label>
              <input type="number" step="0.01" min="1" required value={createForm.amount} onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })} className={inputClass} placeholder="50.00" />
            </div>
            <div>
              <label className={labelClass}>Recipient Email *</label>
              <input type="email" required value={createForm.recipient_email} onChange={(e) => setCreateForm({ ...createForm, recipient_email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Recipient Name</label>
              <input type="text" value={createForm.recipient_name} onChange={(e) => setCreateForm({ ...createForm, recipient_name: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Issued By</label>
              <input type="text" value={createForm.issued_by_name} onChange={(e) => setCreateForm({ ...createForm, issued_by_name: e.target.value })} className={inputClass} placeholder="Box Office" />
            </div>
            <div>
              <label className={labelClass}>Message</label>
              <input type="text" maxLength={500} value={createForm.message} onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })} className={inputClass} />
            </div>
          </div>
          {createError && <p className="text-sm" style={{ color: "#9C4A38" }}>{createError}</p>}
          <button type="submit" disabled={createStatus === "loading"} className="px-6 py-2 bg-charcoal text-off-white text-sm font-semibold hover:bg-charcoal-2 disabled:opacity-50 transition-colors">
            {createStatus === "loading" ? "Creating..." : "Create & Activate"}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} sm:max-w-xs`}
          placeholder="Search by code or email..."
        />
        <div className="flex gap-2">
          {(["all", "active", "pending", "voided"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-xs tracking-wide px-3 py-2 transition-colors ${
                filter === f
                  ? "bg-charcoal text-off-white"
                  : "border border-charcoal/10 text-muted hover:text-charcoal"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted">No gift cards found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((card) => (
            <div
              key={card.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-charcoal/10 px-5 py-4 gap-3"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-charcoal">{card.code}</span>
                    {getStatusBadge(card)}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {card.recipient_email}
                    {card.recipient_name && <span className="ml-1">({card.recipient_name})</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold text-charcoal">
                    ${(card.balance_cents / 100).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted">
                    of ${(card.original_amount_cents / 100).toFixed(2)}
                  </div>
                </div>
                {card.is_active && !card.is_voided && card.balance_cents > 0 && (
                  <button
                    onClick={() => voidCard(card.id)}
                    className="text-xs px-3 py-1 border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Void
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
