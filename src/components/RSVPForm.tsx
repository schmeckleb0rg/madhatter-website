"use client";

import { useState } from "react";

type RSVPFormProps = {
  eventId: string;
  eventTitle: string;
};

export default function RSVPForm({ eventId, eventTitle }: RSVPFormProps) {
  const [form, setForm] = useState({ name: "", email: "", party_size: "1", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          name: form.name,
          email: form.email,
          party_size: parseInt(form.party_size),
          message: form.message || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setError("Connection error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 text-center space-y-3">
        <div className="text-2xl" aria-hidden="true">&#10003;</div>
        <h3 className="font-display text-lg font-semibold text-charcoal dark:text-[#F0ECE3]">
          You&apos;re on the list!
        </h3>
        <p className="text-sm text-muted dark:text-[#7A7264]">
          Your RSVP for {eventTitle} has been confirmed. Check your email for details.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-off-white dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 px-4 py-3 text-charcoal dark:text-[#F0ECE3] text-sm focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass = "block font-mono text-xs uppercase tracking-widest text-muted dark:text-[#7A7264] mb-2";

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 space-y-5">
      <h3 className="font-display text-lg font-semibold text-charcoal dark:text-[#F0ECE3]">RSVP</h3>
      <p className="text-sm text-muted dark:text-[#7A7264] -mt-2">This is a free event. Reserve your spot below.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="rsvp-name" className={labelClass}>
            Name <span aria-hidden="true">*</span><span className="sr-only">(required)</span>
          </label>
          <input id="rsvp-name" type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass} placeholder="Your name" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="rsvp-email" className={labelClass}>
            Email <span aria-hidden="true">*</span><span className="sr-only">(required)</span>
          </label>
          <input id="rsvp-email" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass} placeholder="your@email.com" autoComplete="email" />
        </div>
      </div>

      <div>
        <label htmlFor="rsvp-party-size" className={labelClass}>Party Size</label>
        <select id="rsvp-party-size" value={form.party_size}
          onChange={(e) => setForm({ ...form, party_size: e.target.value })} className={inputClass}>
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i + 1} value={(i + 1).toString()}>
              {i + 1} {i === 0 ? "person" : "people"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="rsvp-message" className={labelClass}>Message (optional)</label>
        <textarea id="rsvp-message" rows={3} value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${inputClass} resize-none`} placeholder="Any special requests..." />
      </div>

      {error && <p role="alert" className="text-sm" style={{ color: "#9C4A38" }}>{error}</p>}

      <button type="submit" disabled={status === "loading"}
        className="w-full py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 disabled:opacity-50 transition-colors dark:bg-gold dark:text-[#0D0C0A] dark:hover:bg-[#D4A84B]">
        {status === "loading" ? "Submitting..." : "Confirm RSVP"}
      </button>
    </form>
  );
}
