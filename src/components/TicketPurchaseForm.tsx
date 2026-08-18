"use client";

import { useState } from "react";

type TicketPurchaseFormProps = {
  eventId: string;
  priceCents: number;
  remaining: number;
};

export default function TicketPurchaseForm({ eventId, priceCents, remaining }: TicketPurchaseFormProps) {
  const maxQty = Math.min(10, remaining);
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const subtotal = (priceCents * quantity) / 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: eventId, quantity, email, name: name || undefined }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setStatus("error");
      return;
    }

    const { url } = await res.json();
    window.location.href = url;
  }

  const inputClass =
    "w-full bg-[#0a0a0a] border border-club-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-club-gold/50 transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className={labelClass}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Your name"
        />
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>Email *</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      {/* Quantity */}
      <div>
        <label className={labelClass}>Number of Tickets *</label>
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className={inputClass}
        >
          {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "ticket" : "tickets"}
            </option>
          ))}
        </select>
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-between py-3 border-t border-club-border">
        <span className="text-sm text-gray-400">Subtotal</span>
        <span className="text-lg font-bold text-white">${subtotal.toFixed(2)}</span>
      </div>

      {error && <p className="text-club-red text-sm">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 bg-club-red text-white font-bold rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {status === "loading" ? "Redirecting to checkout..." : `Checkout — $${subtotal.toFixed(2)}`}
      </button>

      <p className="text-xs text-gray-600 text-center">
        You&apos;ll be redirected to Stripe&apos;s secure checkout to complete your purchase.
      </p>
    </form>
  );
}
