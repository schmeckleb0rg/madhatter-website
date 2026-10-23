"use client";

import { useState } from "react";

type JobApplicationFormProps = {
  listings: { id: string; title: string }[];
};

export default function JobApplicationForm({ listings }: JobApplicationFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [listingId, setListingId] = useState("");
  const [whyInterested, setWhyInterested] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/employment/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId || null,
          name, email, phone: phone || null,
          answers: { why_interested: whyInterested, experience, availability },
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setStatus("sent");
      setName(""); setEmail(""); setPhone(""); setListingId("");
      setWhyInterested(""); setExperience(""); setAvailability("");
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
        <p className="text-charcoal dark:text-[#F0ECE3] font-semibold">Application Submitted!</p>
        <p className="text-sm text-muted dark:text-[#7A7264] mt-1">We&apos;ll review your application and get back to you soon.</p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-off-white dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 px-3 py-2.5 text-sm text-charcoal dark:text-[#F0ECE3] placeholder:text-muted/50 dark:placeholder:text-[#7A7264]/50 focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass = "block text-xs font-mono text-muted dark:text-[#7A7264] uppercase tracking-wider mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {listings.length > 0 && (
        <div>
          <label htmlFor="job-position" className={labelClass}>Position</label>
          <select id="job-position" value={listingId} onChange={(e) => setListingId(e.target.value)} className={inputClass}>
            <option value="">General Interest</option>
            {listings.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="job-name" className={labelClass}>
            Name <span aria-hidden="true">*</span><span className="sr-only">(required)</span>
          </label>
          <input id="job-name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Your name" className={inputClass} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="job-email" className={labelClass}>
            Email <span aria-hidden="true">*</span><span className="sr-only">(required)</span>
          </label>
          <input id="job-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" className={inputClass} autoComplete="email" />
        </div>
      </div>

      <div>
        <label htmlFor="job-phone" className={labelClass}>Phone</label>
        <input id="job-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
          placeholder="(312) 555-0100" className={inputClass} autoComplete="tel" />
      </div>

      <div>
        <label htmlFor="job-why" className={labelClass}>
          Why are you interested? <span aria-hidden="true">*</span><span className="sr-only">(required)</span>
        </label>
        <textarea id="job-why" required value={whyInterested} onChange={(e) => setWhyInterested(e.target.value)}
          rows={3} placeholder="Tell us why you'd be a great fit..." className={inputClass} />
      </div>

      <div>
        <label htmlFor="job-experience" className={labelClass}>Relevant experience</label>
        <textarea id="job-experience" value={experience} onChange={(e) => setExperience(e.target.value)}
          rows={3} placeholder="Previous work in hospitality, comedy, events, etc." className={inputClass} />
      </div>

      <div>
        <label htmlFor="job-availability" className={labelClass}>Availability</label>
        <input id="job-availability" type="text" value={availability} onChange={(e) => setAvailability(e.target.value)}
          placeholder="Evenings & weekends, full-time, etc." className={inputClass} />
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">Something went wrong. Please try again.</p>
      )}

      <button type="submit" disabled={status === "sending"}
        className="w-full py-3 bg-charcoal dark:bg-gold text-off-white dark:text-[#0D0C0A] font-semibold text-sm hover:bg-charcoal-2 dark:hover:bg-[#D4A84B] transition-colors disabled:opacity-50 btn-shimmer">
        {status === "sending" ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
