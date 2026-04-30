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
      <div className="bg-club-card border border-club-gold/30 rounded-lg p-10 text-center">
        <div className="text-4xl mb-4">🎩</div>
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
          Request Received!
        </h3>
        <p className="text-gray-400 text-sm">
          We&apos;ll be in touch soon to confirm your tickets.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-club-red hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Name <span className="text-club-red">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-club-bg border border-club-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-club-gold/50 transition-colors"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Email <span className="text-club-red">*</span>
          </label>
          <input
            type="email"
            required
            maxLength={200}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-club-bg border border-club-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-club-gold/50 transition-colors"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Phone + Party Size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Phone
          </label>
          <input
            type="tel"
            maxLength={20}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-club-bg border border-club-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-club-gold/50 transition-colors"
            placeholder="(312) 555-0100"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Party Size
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={form.party_size}
            onChange={(e) => setForm({ ...form, party_size: e.target.value })}
            className="w-full bg-club-bg border border-club-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-club-gold/50 transition-colors"
          />
        </div>
      </div>

      {/* Event */}
      {events.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Show
          </label>
          <select
            value={form.event_id}
            onChange={(e) => setForm({ ...form, event_id: e.target.value })}
            className="w-full bg-club-bg border border-club-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-club-gold/50 transition-colors"
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
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Message
        </label>
        <textarea
          rows={4}
          maxLength={1000}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full bg-club-bg border border-club-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-club-gold/50 transition-colors resize-none"
          placeholder="Any questions or special requests?"
        />
      </div>

      {errorMsg && (
        <p className="text-club-red text-sm">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 bg-club-red text-white font-bold rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {status === "loading" ? "Sending..." : "Request Tickets"}
      </button>
    </form>
  );
}
