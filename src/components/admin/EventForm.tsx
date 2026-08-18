"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Event, PastEvent } from "@/lib/supabase";

type EventFormProps = {
  type: "event" | "past-event";
  initialData?: Partial<Event> | Partial<PastEvent>;
  id?: string;
};

export default function EventForm({ type, initialData, id }: EventFormProps) {
  const router = useRouter();
  const isEvent = type === "event";
  const apiBase = isEvent ? "/api/admin/events" : "/api/admin/past-events";

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    performer: initialData?.performer ?? "",
    date: initialData?.date ? new Date(initialData.date).toISOString().slice(0, 16) : "",
    image_url: initialData?.image_url ?? "",
    // Event-only fields
    doors_time: (initialData as Partial<Event>)?.doors_time ?? "",
    show_time: (initialData as Partial<Event>)?.show_time ?? "",
    ticket_price: (initialData as Partial<Event>)?.ticket_price ?? "",
    ticket_price_cents: (initialData as Partial<Event>)?.ticket_price_cents ?? "",
    ticket_capacity: (initialData as Partial<Event>)?.ticket_capacity ?? "",
    is_sold_out: (initialData as Partial<Event>)?.is_sold_out ?? false,
    is_featured: (initialData as Partial<Event>)?.is_featured ?? false,
  });

  const ticketsSold = isEvent ? ((initialData as Partial<Event>)?.tickets_sold ?? 0) : 0;

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const eventPayload = {
      ...form,
      ticket_price_cents: form.ticket_price_cents ? Number(form.ticket_price_cents) : null,
      ticket_capacity: form.ticket_capacity ? Number(form.ticket_capacity) : null,
      // Auto-generate display price from cents
      ticket_price: form.ticket_price_cents ? `$${(Number(form.ticket_price_cents) / 100).toFixed(2)}` : form.ticket_price || null,
    };

    const payload = isEvent
      ? eventPayload
      : { title: form.title, description: form.description, performer: form.performer, date: form.date, image_url: form.image_url };

    const res = await fetch(id ? `${apiBase}/${id}` : apiBase, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setStatus("error");
      return;
    }

    router.push(isEvent ? "/admin/events" : "/admin/past-events");
    router.refresh();
  }

  async function handleDelete() {
    if (!id || !confirm("Delete this record? This cannot be undone.")) return;
    await fetch(`${apiBase}/${id}`, { method: "DELETE" });
    router.push(isEvent ? "/admin/events" : "/admin/past-events");
    router.refresh();
  }

  const inputClass =
    "w-full bg-[#0a0a0a] border border-club-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-club-gold/50 transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className={labelClass}>Title *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* Performer */}
      <div>
        <label className={labelClass}>Performer / Headliner</label>
        <input
          type="text"
          value={form.performer}
          onChange={(e) => setForm({ ...form, performer: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* Date */}
      <div>
        <label className={labelClass}>Date & Time *</label>
        <input
          type="datetime-local"
          required
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* Event-only fields */}
      {isEvent && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Doors Time</label>
            <input
              type="text"
              value={form.doors_time}
              onChange={(e) => setForm({ ...form, doors_time: e.target.value })}
              className={inputClass}
              placeholder="7:00 PM"
            />
          </div>
          <div>
            <label className={labelClass}>Show Time</label>
            <input
              type="text"
              value={form.show_time}
              onChange={(e) => setForm({ ...form, show_time: e.target.value })}
              className={inputClass}
              placeholder="8:00 PM"
            />
          </div>
          <div>
            <label className={labelClass}>Ticket Price</label>
            <input
              type="text"
              value={form.ticket_price}
              onChange={(e) => setForm({ ...form, ticket_price: e.target.value })}
              className={inputClass}
              placeholder="$20"
            />
          </div>
        </div>
      )}

      {/* Ticketing (event-only) */}
      {isEvent && (
        <div className="border border-club-border rounded-lg p-5 space-y-5">
          <div className="text-xs font-semibold text-club-gold uppercase tracking-wide">Online Ticketing</div>
          <p className="text-xs text-gray-600 -mt-3">Set both price and capacity to enable online ticket sales via Stripe.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Ticket Price (cents)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.ticket_price_cents}
                onChange={(e) => setForm({ ...form, ticket_price_cents: e.target.value })}
                className={inputClass}
                placeholder="2000 = $20.00"
              />
              {form.ticket_price_cents && (
                <p className="text-xs text-gray-500 mt-1">= ${(Number(form.ticket_price_cents) / 100).toFixed(2)}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Ticket Capacity</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.ticket_capacity}
                onChange={(e) => setForm({ ...form, ticket_capacity: e.target.value })}
                className={inputClass}
                placeholder="Total tickets available"
              />
            </div>
          </div>
          {id && isEvent && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Tickets Sold:</span>
              <span className="text-white font-semibold">{ticketsSold}</span>
              {form.ticket_capacity && (
                <span className="text-gray-600">/ {form.ticket_capacity}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Image URL */}
      <div>
        <label className={labelClass}>Image URL</label>
        <input
          type="url"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className={inputClass}
          placeholder="https://..."
        />
      </div>

      {/* Event-only toggles */}
      {isEvent && (
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="accent-club-gold"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_sold_out}
              onChange={(e) => setForm({ ...form, is_sold_out: e.target.checked })}
              className="accent-club-red"
            />
            Sold Out
          </label>
        </div>
      )}

      {error && <p className="text-club-red text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-1 py-3 bg-club-red text-white font-bold rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {status === "loading" ? "Saving..." : id ? "Update" : "Create"}
        </button>
        {id && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-3 border border-red-900/50 text-red-500 rounded hover:bg-red-900/20 transition-colors text-sm"
          >
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-club-border text-gray-400 rounded hover:text-white transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
