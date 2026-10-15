"use client";

import { useState } from "react";

type GiftCardClientProps = {
  denominations: number[];
  customMin: number;
  customMax: number;
};

export default function GiftCardClient({ denominations, customMin, customMax }: GiftCardClientProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(denominations[0] ?? null);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  // Balance check
  const [lookupCode, setLookupCode] = useState("");
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "found" | "error">("idle");
  const [lookupResult, setLookupResult] = useState<{ balance_cents: number; expired: boolean; expires_at: string | null } | null>(null);
  const [lookupError, setLookupError] = useState("");

  const amountCents = isCustom ? Math.round(parseFloat(customAmount || "0") * 100) : (selectedAmount ?? 0);

  async function handlePurchase(e: React.FormEvent) {
    e.preventDefault();
    if (!amountCents || amountCents < customMin || amountCents > customMax) {
      setError(`Amount must be between $${(customMin / 100).toFixed(2)} and $${(customMax / 100).toFixed(2)}`);
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/gift-cards/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_cents: amountCents,
          sender_name: senderName || undefined,
          sender_email: senderEmail,
          recipient_name: recipientName || undefined,
          recipient_email: recipientEmail,
          message: message || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setStatus("error");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Connection error. Please try again.");
      setStatus("error");
    }
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupStatus("loading");
    setLookupError("");

    try {
      const res = await fetch("/api/gift-cards/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: lookupCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || "Card not found");
        setLookupStatus("error");
        return;
      }

      setLookupResult(data);
      setLookupStatus("found");
    } catch {
      setLookupError("Connection error");
      setLookupStatus("error");
    }
  }

  const inputClass =
    "w-full bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 px-4 py-3 text-charcoal dark:text-[#F0ECE3] text-sm focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass = "block font-mono text-xs uppercase tracking-widest text-muted dark:text-[#7A7264] mb-2";

  return (
    <div className="space-y-12">
      {/* Purchase Form */}
      <form onSubmit={handlePurchase} className="space-y-6">
        {/* Amount Selection */}
        <div>
          <label className={labelClass}>Select Amount</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {denominations.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => { setSelectedAmount(amt); setIsCustom(false); }}
                className={`py-3 text-center font-mono text-sm border transition-all duration-200 ${
                  !isCustom && selectedAmount === amt
                    ? "border-gold bg-gold/10 text-charcoal dark:text-[#F0ECE3] font-semibold"
                    : "border-charcoal/10 dark:border-gold/10 text-muted dark:text-[#7A7264] hover:border-gold/30"
                }`}
              >
                ${(amt / 100).toFixed(0)}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`text-xs font-mono tracking-wide transition-colors ${
                isCustom ? "text-gold font-semibold" : "text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3]"
              }`}
            >
              Custom Amount
            </button>
            {isCustom && (
              <div className="mt-2 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted dark:text-[#7A7264] text-sm">$</span>
                <input
                  type="number"
                  min={(customMin / 100).toFixed(2)}
                  max={(customMax / 100).toFixed(2)}
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className={`${inputClass} pl-8`}
                  placeholder={`${(customMin / 100).toFixed(0)} – ${(customMax / 100).toFixed(0)}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sender Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Your Name</label>
            <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} className={inputClass} placeholder="Optional" />
          </div>
          <div>
            <label className={labelClass}>Your Email *</label>
            <input type="email" required value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} className={inputClass} placeholder="your@email.com" />
          </div>
        </div>

        {/* Recipient Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Recipient Name</label>
            <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={inputClass} placeholder="Optional" />
          </div>
          <div>
            <label className={labelClass}>Recipient Email *</label>
            <input type="email" required value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className={inputClass} placeholder="recipient@email.com" />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className={labelClass}>Personal Message</label>
          <textarea
            rows={3}
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder="Add a personal message (optional)"
          />
        </div>

        {error && <p className="text-sm" style={{ color: "#9C4A38" }}>{error}</p>}

        <button
          type="submit"
          disabled={status === "loading" || !amountCents}
          className="w-full py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 disabled:opacity-50 transition-colors btn-shimmer dark:bg-gold dark:text-[#0D0C0A] dark:hover:bg-[#D4A84B]"
        >
          {status === "loading"
            ? "Processing..."
            : amountCents
              ? `Purchase $${(amountCents / 100).toFixed(2)} Gift Card`
              : "Select an Amount"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-charcoal/10 dark:bg-gold/10" />
        <span className="font-mono text-xs tracking-widest uppercase text-muted dark:text-[#7A7264]">Check Balance</span>
        <div className="flex-1 h-px bg-charcoal/10 dark:bg-gold/10" />
      </div>

      {/* Balance Check */}
      <form onSubmit={handleLookup} className="space-y-4">
        <div>
          <label className={labelClass}>Gift Card Code</label>
          <input
            type="text"
            value={lookupCode}
            onChange={(e) => setLookupCode(e.target.value)}
            className={inputClass}
            placeholder="MH-XXXX-XXXX-XXXX"
            required
          />
        </div>

        <button
          type="submit"
          disabled={lookupStatus === "loading"}
          className="w-full py-3 border border-charcoal/20 dark:border-gold/20 text-charcoal dark:text-[#F0ECE3] text-sm font-semibold hover:bg-charcoal hover:text-off-white dark:hover:bg-gold dark:hover:text-[#0D0C0A] disabled:opacity-50 transition-colors"
        >
          {lookupStatus === "loading" ? "Checking..." : "Check Balance"}
        </button>

        {lookupError && <p className="text-sm" style={{ color: "#9C4A38" }}>{lookupError}</p>}

        {lookupResult && lookupStatus === "found" && (
          <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 text-center">
            <p className="font-mono text-xs uppercase tracking-wide text-muted dark:text-[#7A7264] mb-2">Available Balance</p>
            <p className="text-3xl font-bold text-charcoal dark:text-[#F0ECE3]">
              ${(lookupResult.balance_cents / 100).toFixed(2)}
            </p>
            {lookupResult.expired && (
              <p className="text-xs mt-2" style={{ color: "#9C4A38" }}>This gift card has expired.</p>
            )}
            {lookupResult.expires_at && !lookupResult.expired && (
              <p className="text-xs text-muted dark:text-[#7A7264] mt-2">
                Expires: {new Date(lookupResult.expires_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
