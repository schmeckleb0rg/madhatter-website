"use client";

import { useState } from "react";

const eventTypes = ["Corporate", "Birthday", "Wedding", "Private Show", "Other"];
const budgetRanges = [
  "Under $1,000",
  "$1,000 - $2,500",
  "$2,500 - $5,000",
  "$5,000 - $10,000",
  "$10,000+",
];

export default function PrivateEventForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    event_type: "",
    guest_count: "",
    preferred_date: "",
    budget_range: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/private-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          guest_count: form.guest_count ? parseInt(form.guest_count, 10) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        event_type: "",
        guest_count: "",
        preferred_date: "",
        budget_range: "",
        message: "",
      });
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-off-white-2 border border-gold/30 p-10 text-center">
        <h3 className="font-display text-xl font-semibold text-charcoal mb-2">
          Inquiry Received!
        </h3>
        <p className="text-muted text-sm">
          Thanks for your interest! Our events team will be in touch within 24 hours.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-gold hover:underline"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass = "block font-mono text-xs font-medium text-muted uppercase tracking-wide mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>
            Name <span className="text-gold">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className={labelClass}>
            Email <span className="text-gold">*</span>
          </label>
          <input
            type="email"
            required
            maxLength={200}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Phone</label>
          <input
            type="tel"
            maxLength={20}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
            placeholder="(312) 555-0100"
          />
        </div>
        <div>
          <label className={labelClass}>Company</label>
          <input
            type="text"
            maxLength={100}
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className={inputClass}
            placeholder="Company name (if applicable)"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>
            Event Type <span className="text-gold">*</span>
          </label>
          <select
            required
            value={form.event_type}
            onChange={(e) => setForm({ ...form, event_type: e.target.value })}
            className={inputClass}
          >
            <option value="">Select type...</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Estimated Guest Count</label>
          <input
            type="number"
            min={1}
            max={500}
            value={form.guest_count}
            onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
            className={inputClass}
            placeholder="e.g. 50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Preferred Date</label>
          <input
            type="date"
            value={form.preferred_date}
            onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Budget Range</label>
          <select
            value={form.budget_range}
            onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
            className={inputClass}
          >
            <option value="">Select range...</option>
            {budgetRanges.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Message</label>
        <textarea
          rows={4}
          maxLength={2000}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${inputClass} resize-none`}
          placeholder="Tell us about your event, any special requirements, etc."
        />
      </div>

      {errorMsg && <p className="text-sm" style={{ color: "#9C4A38" }}>{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
      >
        {status === "loading" ? "Submitting..." : "Submit Inquiry"}
      </button>
    </form>
  );
}
