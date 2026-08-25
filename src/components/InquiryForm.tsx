"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type EventOption = { id: string; title: string; date: string };

export default function InquiryForm({ events }: { events: EventOption[] }) {
  const searchParams = useSearchParams();
  const preselectedEventId = searchParams.get("event") ?? "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    event_id: preselectedEventId,
    party_size: "2",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (preselectedEventId) {
      setForm((f) => ({ ...f, event_id: preselectedEventId }));
    }
  }, [preselectedEventId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({ name: "", email: "", phone: "", event_id: "", party_size: "2", message: "" });
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-off-white-2 border border-gold/30 p-10 text-center dark:bg-[#1C1A16] dark:border-gold/10">
        <h3 className="font-display text-xl font-semibold text-charcoal mb-2 dark:text-[#F0ECE3]">
          Request Received!
        </h3>
        <p className="text-muted text-sm dark:text-[#7A7264]">
          We&apos;ll be in touch soon to confirm your tickets.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-gold hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors dark:bg-[#161412] dark:border-gold/10 dark:text-[#F0ECE3] dark:placeholder:text-[#7A7264]/50";
  const labelClass = "block font-mono text-xs font-medium text-muted uppercase tracking-wide mb-2 dark:text-[#7A7264]";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name + Email */}
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

      {/* Phone + Party Size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>
            Phone
          </label>
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
          <label className={labelClass}>
            Party Size
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={form.party_size}
            onChange={(e) => setForm({ ...form, party_size: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      {/* Event */}
      {events.length > 0 && (
        <div>
          <label className={labelClass}>
            Show
          </label>
          <select
            value={form.event_id}
            onChange={(e) => setForm({ ...form, event_id: e.target.value })}
            className={inputClass}
          >
            <option value="">Select a show (optional)</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} — {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Message */}
      <div>
        <label className={labelClass}>
          Message
        </label>
        <textarea
          rows={4}
          maxLength={1000}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${inputClass} resize-none`}
          placeholder="Any questions or special requests?"
        />
      </div>

      {errorMsg && (
        <p className="text-sm" style={{ color: "#9C4A38" }}>{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 disabled:opacity-50 transition-colors dark:bg-gold dark:text-[#0D0C0A] dark:hover:bg-[#D4A84B] btn-shimmer"
      >
        {status === "loading" ? "Sending..." : "Request Tickets"}
      </button>
    </form>
  );
}
