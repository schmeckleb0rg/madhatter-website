"use client";

import { useState } from "react";

export default function PodcastBookingForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    podcastName: "",
    date: "",
    duration: "2",
    equipmentNeeds: "",
    liveAudience: false,
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function update(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/event-spaces/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "podcast" }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-green-500/10 rounded-full">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-charcoal dark:text-[#F0ECE3] font-semibold">Booking Request Sent!</p>
        <p className="text-sm text-muted dark:text-[#7A7264] mt-1">
          We&apos;ll confirm your studio time within 48 hours.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-off-white dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 px-3 py-2.5 text-sm text-charcoal dark:text-[#F0ECE3] placeholder:text-muted/50 dark:placeholder:text-[#7A7264]/50 focus:outline-none focus:border-gold/50 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Your Name *</label>
          <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Email *</label>
          <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(312) 555-0100" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Podcast Name</label>
          <input value={form.podcastName} onChange={(e) => update("podcastName", e.target.value)} placeholder="Your podcast name" className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Preferred Date *</label>
          <input type="date" required value={form.date} onChange={(e) => update("date", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Duration (hours)</label>
          <select value={form.duration} onChange={(e) => update("duration", e.target.value)} className={inputClass}>
            <option value="1">1 hour</option>
            <option value="2">2 hours</option>
            <option value="3">3 hours</option>
            <option value="4">4 hours</option>
            <option value="half-day">Half day</option>
            <option value="full-day">Full day</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Equipment Needs</label>
        <input value={form.equipmentNeeds} onChange={(e) => update("equipmentNeeds", e.target.value)} placeholder="Extra mics, video recording, etc." className={inputClass} />
      </div>
      <label className="flex items-center gap-2 text-sm text-charcoal dark:text-[#F0ECE3]">
        <input
          type="checkbox"
          checked={form.liveAudience}
          onChange={(e) => update("liveAudience", e.target.checked)}
          className="accent-gold"
        />
        I&apos;m interested in recording with a live audience
      </label>
      <div>
        <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Additional Notes</label>
        <textarea value={form.message} onChange={(e) => update("message", e.target.value)} rows={3} placeholder="Tell us more about your podcast..." className={inputClass} />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full py-3 bg-charcoal dark:bg-gold text-off-white dark:text-[#0D0C0A] font-semibold text-sm hover:bg-charcoal-2 dark:hover:bg-[#D4A84B] transition-colors disabled:opacity-50 btn-shimmer"
      >
        {status === "sending" ? "Sending..." : "Request Booking"}
      </button>
    </form>
  );
}
