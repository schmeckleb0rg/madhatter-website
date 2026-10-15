"use client";

import { useState } from "react";

export default function CorporateInquiryForm() {
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    attendees: "",
    date: "",
    budget: "",
    avNeeds: "",
    catering: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/event-spaces/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "corporate" }),
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
        <p className="text-charcoal dark:text-[#F0ECE3] font-semibold">Inquiry Sent!</p>
        <p className="text-sm text-muted dark:text-[#7A7264] mt-1">
          Our events team will be in touch within 24 hours.
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
          <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Company *</label>
          <input required value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Company name" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Your Name *</label>
          <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Email *</label>
          <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@company.com" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(312) 555-0100" className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Attendees *</label>
          <input required value={form.attendees} onChange={(e) => update("attendees", e.target.value)} placeholder="~50" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Preferred Date</label>
          <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Budget Range</label>
          <input value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="$2,000-$5,000" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">AV / Production Needs</label>
        <input value={form.avNeeds} onChange={(e) => update("avNeeds", e.target.value)} placeholder="Projector, microphone, etc." className={inputClass} />
      </div>
      <div>
        <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Catering</label>
        <input value={form.catering} onChange={(e) => update("catering", e.target.value)} placeholder="Cocktail reception, dinner, etc." className={inputClass} />
      </div>
      <div>
        <label className="block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5">Additional Details</label>
        <textarea value={form.message} onChange={(e) => update("message", e.target.value)} rows={3} placeholder="Tell us more about your event..." className={inputClass} />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full py-3 bg-charcoal dark:bg-gold text-off-white dark:text-[#0D0C0A] font-semibold text-sm hover:bg-charcoal-2 dark:hover:bg-[#D4A84B] transition-colors disabled:opacity-50 btn-shimmer"
      >
        {status === "sending" ? "Sending..." : "Submit Inquiry"}
      </button>
    </form>
  );
}
