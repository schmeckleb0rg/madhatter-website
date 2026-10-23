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

  async function handleSubmit(e: { preventDefault(): void }) {
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
        <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-green-500/10 rounded-full" aria-hidden="true">
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
  const labelClass = "block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="corp-company" className={labelClass}>
            Company <span aria-hidden="true">*</span><span className="sr-only">(required)</span>
          </label>
          <input id="corp-company" required value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Company name" className={inputClass} autoComplete="organization" />
        </div>
        <div>
          <label htmlFor="corp-name" className={labelClass}>
            Your Name <span aria-hidden="true">*</span><span className="sr-only">(required)</span>
          </label>
          <input id="corp-name" required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" className={inputClass} autoComplete="name" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="corp-email" className={labelClass}>
            Email <span aria-hidden="true">*</span><span className="sr-only">(required)</span>
          </label>
          <input id="corp-email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@company.com" className={inputClass} autoComplete="email" />
        </div>
        <div>
          <label htmlFor="corp-phone" className={labelClass}>Phone</label>
          <input id="corp-phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(312) 555-0100" className={inputClass} autoComplete="tel" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="corp-attendees" className={labelClass}>
            Attendees <span aria-hidden="true">*</span><span className="sr-only">(required)</span>
          </label>
          <input id="corp-attendees" required value={form.attendees} onChange={(e) => update("attendees", e.target.value)} placeholder="~50" className={inputClass} />
        </div>
        <div>
          <label htmlFor="corp-date" className={labelClass}>Preferred Date</label>
          <input id="corp-date" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="corp-budget" className={labelClass}>Budget Range</label>
          <input id="corp-budget" value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="$2,000–$5,000" className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="corp-av" className={labelClass}>AV / Production Needs</label>
        <input id="corp-av" value={form.avNeeds} onChange={(e) => update("avNeeds", e.target.value)} placeholder="Projector, microphone, etc." className={inputClass} />
      </div>
      <div>
        <label htmlFor="corp-catering" className={labelClass}>Catering</label>
        <input id="corp-catering" value={form.catering} onChange={(e) => update("catering", e.target.value)} placeholder="Cocktail reception, dinner, etc." className={inputClass} />
      </div>
      <div>
        <label htmlFor="corp-message" className={labelClass}>Additional Details</label>
        <textarea id="corp-message" value={form.message} onChange={(e) => update("message", e.target.value)} rows={3} placeholder="Tell us more about your event..." className={inputClass} />
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">Something went wrong. Please try again.</p>
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
