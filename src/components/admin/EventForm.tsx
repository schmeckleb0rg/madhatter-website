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
    detailed_description: (initialData as Partial<Event>)?.detailed_description ?? "",
    performer: initialData?.performer ?? "",
    comedian_id: (initialData as Partial<Event>)?.comedian_id ?? "",
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

  const existingLineup = (initialData as Partial<Event>)?.lineup ?? [];
  const [lineup, setLineup] = useState<{ name: string; role: string }[]>(
    existingLineup.length > 0
      ? existingLineup.map((l) => ({ name: l.name, role: l.role ?? "" }))
      : []
  );

  const ticketsSold = isEvent ? ((initialData as Partial<Event>)?.tickets_sold ?? 0) : 0;

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  function addLineupEntry() {
    setLineup([...lineup, { name: "", role: "" }]);
  }

  function removeLineupEntry(index: number) {
    setLineup(lineup.filter((_, i) => i !== index));
  }

  function updateLineupEntry(index: number, field: "name" | "role", value: string) {
    setLineup(lineup.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

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
      detailed_description: form.detailed_description || null,
      comedian_id: form.comedian_id || null,
      lineup: lineup.filter((l) => l.name.trim()).map((l) => ({
        name: l.name.trim(),
        role: l.role.trim() || undefined,
      })),
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
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass = "block font-mono text-xs uppercase tracking-widest text-muted mb-2";

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

      {/* Comedian ID */}
      {isEvent && (
        <div>
          <label className={labelClass}>Comedian ID (optional)</label>
          <input
            type="text"
            value={form.comedian_id}
            onChange={(e) => setForm({ ...form, comedian_id: e.target.value })}
            className={inputClass}
            placeholder="Paste comedian UUID to link this event"
          />
          <p className="text-xs text-muted mt-1">Links this event to a comedian profile.</p>
        </div>
      )}

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
        <div className="border border-charcoal/10 p-5 space-y-5">
          <div className="font-mono text-xs uppercase tracking-widest text-gold">Online Ticketing</div>
          <p className="text-xs text-muted -mt-3">Set both price and capacity to enable online ticket sales via Square.</p>
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
                <p className="text-xs text-muted mt-1">= ${(Number(form.ticket_price_cents) / 100).toFixed(2)}</p>
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
              <span className="text-muted">Tickets Sold:</span>
              <span className="text-charcoal font-semibold">{ticketsSold}</span>
              {form.ticket_capacity && (
                <span className="text-muted">/ {form.ticket_capacity}</span>
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

      {/* Detailed Description (event-only) */}
      {isEvent && (
        <div>
          <label className={labelClass}>Detailed Description (shown in popup)</label>
          <textarea
            rows={6}
            value={form.detailed_description}
            onChange={(e) => setForm({ ...form, detailed_description: e.target.value })}
            className={`${inputClass} resize-none`}
            placeholder="Extended description shown when visitors click into the event details..."
          />
        </div>
      )}

      {/* Lineup (event-only) */}
      {isEvent && (
        <div className="border border-charcoal/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs uppercase tracking-widest text-gold">Lineup</div>
            <button
              type="button"
              onClick={addLineupEntry}
              className="text-xs px-3 py-1 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors"
            >
              + Add Performer
            </button>
          </div>
          {lineup.length === 0 && (
            <p className="text-xs text-muted">No lineup entries yet. Click &quot;Add Performer&quot; to add acts to this show.</p>
          )}
          {lineup.map((entry, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={entry.name}
                  onChange={(e) => updateLineupEntry(i, "name", e.target.value)}
                  className={inputClass}
                  placeholder="Performer name"
                />
              </div>
              <div className="w-40">
                <input
                  type="text"
                  value={entry.role}
                  onChange={(e) => updateLineupEntry(i, "role", e.target.value)}
                  className={inputClass}
                  placeholder="Role (e.g., Host)"
                />
              </div>
              <button
                type="button"
                onClick={() => removeLineupEntry(i)}
                className="mt-3 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

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
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="accent-gold"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_sold_out}
              onChange={(e) => setForm({ ...form, is_sold_out: e.target.checked })}
              className="accent-charcoal"
            />
            Sold Out
          </label>
        </div>
      )}

      {error && <p className="text-sm" style={{ color: "#9C4A38" }}>{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-1 py-3 bg-charcoal text-off-white font-bold hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
        >
          {status === "loading" ? "Saving..." : id ? "Update" : "Create"}
        </button>
        {id && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-3 border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm"
          >
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-charcoal/10 text-muted hover:text-charcoal transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
