"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Event, PastEvent, EventGenre } from "@/lib/supabase";
import MediaUpload from "@/components/admin/MediaUpload";

const TIMEZONES = [
  { value: "America/Chicago", label: "Central (CST/CDT)" },
  { value: "America/New_York", label: "Eastern (EST/EDT)" },
  { value: "America/Denver", label: "Mountain (MST/MDT)" },
  { value: "America/Los_Angeles", label: "Pacific (PST/PDT)" },
  { value: "America/Anchorage", label: "Alaska (AKST/AKDT)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HST)" },
];

type EventFormProps = {
  type: "event" | "past-event";
  initialData?: Partial<Event> | Partial<PastEvent>;
  id?: string;
};

export default function EventForm({ type, initialData, id }: EventFormProps) {
  const router = useRouter();
  const isEvent = type === "event";
  const apiBase = isEvent ? "/api/admin/events" : "/api/admin/past-events";

  const initEvent = initialData as Partial<Event> | undefined;
  const existingDuration = initEvent?.event_duration_minutes;

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    detailed_description: initEvent?.detailed_description ?? "",
    performer: initialData?.performer ?? "",
    comedian_id: initEvent?.comedian_id ?? "",
    date: initialData?.date ? new Date(initialData.date).toISOString().slice(0, 16) : "",
    image_url: initialData?.image_url ?? "",
    // Time fields
    timezone: initEvent?.timezone ?? "America/Chicago",
    doors_time: initEvent?.doors_time ?? "",
    show_time: initEvent?.show_time ?? "",
    end_time: initEvent?.end_time ?? "",
    // Ticket pricing in dollars (convert from cents)
    ticket_price_dollars: initEvent?.ticket_price_cents
      ? (initEvent.ticket_price_cents / 100).toString()
      : "",
    ticket_capacity: initEvent?.ticket_capacity ?? "",
    // Toggles
    is_sold_out: initEvent?.is_sold_out ?? false,
    is_featured: initEvent?.is_featured ?? false,
    is_rsvp: initEvent?.is_rsvp ?? false,
    // Badges
    force_just_announced: initEvent?.force_just_announced ?? "auto",
    selling_fast_override: initEvent?.selling_fast_override ?? "auto",
    selling_fast_threshold: initEvent?.selling_fast_threshold ?? "",
    // Duration as hours + minutes
    duration_hours: existingDuration ? Math.floor(existingDuration / 60).toString() : "",
    duration_minutes: existingDuration ? (existingDuration % 60).toString() : "",
    // Calendar
    calendar_description: initEvent?.calendar_description ?? "",
    // Category (kept for backward compat, but genres are primary now)
    event_category: initEvent?.event_category ?? "general",
    where_to_watch_later: initEvent?.where_to_watch_later ?? "",
    audience_etiquette: initEvent?.audience_etiquette ?? "",
    table_preferences: initEvent?.table_preferences
      ? JSON.stringify(initEvent.table_preferences)
      : "",
    // Custom URL
    slug: initEvent?.slug ?? "",
  });

  // Dynamic arrays
  const existingLineup = initEvent?.lineup ?? [];
  const [lineup, setLineup] = useState<{ name: string; role: string }[]>(
    existingLineup.length > 0
      ? existingLineup.map((l) => ({ name: l.name, role: l.role ?? "" }))
      : []
  );

  const [customTimeSlots, setCustomTimeSlots] = useState<{ label: string; time: string }[]>(
    initEvent?.custom_time_slots ?? []
  );

  const [ticketTiers, setTicketTiers] = useState<{ name: string; price_dollars: string; description: string }[]>(
    (initEvent?.ticket_tiers ?? []).map((t) => ({
      name: t.name,
      price_dollars: (t.price_cents / 100).toString(),
      description: t.description ?? "",
    }))
  );

  // Genres (loaded from API)
  const [genres, setGenres] = useState<EventGenre[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);

  const ticketsSold = isEvent ? (initEvent?.tickets_sold ?? 0) : 0;
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  // Load genres and existing genre assignments
  useEffect(() => {
    if (!isEvent) return;
    fetch("/api/admin/genres")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setGenres(data); })
      .catch(() => {});

    if (id) {
      // Fetch genre assignments for this event
      fetch(`/api/admin/events/${id}`)
        .then((r) => r.json())
        .then((event) => {
          // genre_ids are fetched separately — load from event_genre_assignments
          if (event?.genres) {
            setSelectedGenreIds(event.genres.map((g: EventGenre) => g.id));
          }
        })
        .catch(() => {});
    }
  }, [isEvent, id]);

  // Lineup helpers
  function addLineupEntry() { setLineup([...lineup, { name: "", role: "" }]); }
  function removeLineupEntry(index: number) { setLineup(lineup.filter((_, i) => i !== index)); }
  function updateLineupEntry(index: number, field: "name" | "role", value: string) {
    setLineup(lineup.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  // Custom time slot helpers
  function addTimeSlot() { setCustomTimeSlots([...customTimeSlots, { label: "", time: "" }]); }
  function removeTimeSlot(index: number) { setCustomTimeSlots(customTimeSlots.filter((_, i) => i !== index)); }
  function updateTimeSlot(index: number, field: "label" | "time", value: string) {
    setCustomTimeSlots(customTimeSlots.map((s, i) => i === index ? { ...s, [field]: value } : s));
  }

  // Ticket tier helpers
  function addTicketTier() { setTicketTiers([...ticketTiers, { name: "", price_dollars: "", description: "" }]); }
  function removeTicketTier(index: number) { setTicketTiers(ticketTiers.filter((_, i) => i !== index)); }
  function updateTicketTier(index: number, field: string, value: string) {
    setTicketTiers(ticketTiers.map((t, i) => i === index ? { ...t, [field]: value } : t));
  }

  // Genre toggle
  function toggleGenre(genreId: string) {
    setSelectedGenreIds((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  }

  // Slug auto-suggest from title
  function suggestSlug() {
    const slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 100);
    setForm({ ...form, slug });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    let parsedTablePrefs: string[] = [];
    if (form.table_preferences) {
      try { parsedTablePrefs = JSON.parse(form.table_preferences); } catch { /* ignore */ }
    }

    // Convert dollars to cents
    const priceCents = form.ticket_price_dollars
      ? Math.round(parseFloat(form.ticket_price_dollars) * 100)
      : null;

    // Convert hours + minutes to total minutes
    const durationMinutes =
      (form.duration_hours || form.duration_minutes)
        ? (parseInt(form.duration_hours || "0") * 60) + parseInt(form.duration_minutes || "0")
        : null;

    // Convert ticket tiers (dollars to cents)
    const tierPayload = ticketTiers
      .filter((t) => t.name.trim())
      .map((t) => ({
        name: t.name.trim(),
        price_cents: Math.round(parseFloat(t.price_dollars || "0") * 100),
        description: t.description.trim() || undefined,
      }));

    const eventPayload = {
      title: form.title,
      description: form.description || null,
      detailed_description: form.detailed_description || null,
      performer: form.performer || null,
      comedian_id: form.comedian_id || null,
      date: form.date,
      image_url: form.image_url || null,
      timezone: form.timezone,
      doors_time: form.doors_time || null,
      show_time: form.show_time || null,
      end_time: form.end_time || null,
      ticket_price: priceCents ? `$${(priceCents / 100).toFixed(2)}` : null,
      ticket_price_cents: priceCents,
      ticket_capacity: form.ticket_capacity ? Number(form.ticket_capacity) : null,
      ticket_tiers: tierPayload.length > 0 ? tierPayload : null,
      is_sold_out: form.is_sold_out,
      is_featured: form.is_featured,
      is_rsvp: form.is_rsvp,
      force_just_announced: form.force_just_announced,
      selling_fast_override: form.selling_fast_override,
      selling_fast_threshold: form.selling_fast_threshold ? Number(form.selling_fast_threshold) : null,
      event_duration_minutes: durationMinutes,
      event_category: form.event_category,
      calendar_description: form.calendar_description || null,
      where_to_watch_later: form.where_to_watch_later || null,
      audience_etiquette: form.audience_etiquette || null,
      table_preferences: parsedTablePrefs.length > 0 ? parsedTablePrefs : null,
      custom_time_slots: customTimeSlots.filter((s) => s.label.trim() || s.time.trim()),
      slug: form.slug || null,
      genre_ids: selectedGenreIds,
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
  const sectionHeader = "font-mono text-xs uppercase tracking-widest text-gold";
  const addBtn = "text-xs px-3 py-1 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors";

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

      {/* Date & Time */}
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

      {/* Timezone */}
      {isEvent && (
        <div>
          <label className={labelClass}>Time Zone</label>
          <select
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            className={inputClass}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Times: Doors, Show, End */}
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
            <label className={labelClass}>End Time</label>
            <input
              type="text"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              className={inputClass}
              placeholder="10:00 PM, Midnight, Until Late"
            />
          </div>
        </div>
      )}

      {/* Custom Time Slots */}
      {isEvent && (
        <div className="border border-charcoal/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className={sectionHeader}>Custom Time Slots</div>
            <button type="button" onClick={addTimeSlot} className={addBtn}>+ Add Time Slot</button>
          </div>
          {customTimeSlots.length === 0 && (
            <p className="text-xs text-muted">Add custom schedule items like &quot;Cocktails&quot;, &quot;Q&amp;A&quot;, etc.</p>
          )}
          {customTimeSlots.map((slot, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={slot.label}
                  onChange={(e) => updateTimeSlot(i, "label", e.target.value)}
                  className={inputClass}
                  placeholder="Label (e.g., Cocktails)"
                />
              </div>
              <div className="sm:w-40">
                <input
                  type="text"
                  value={slot.time}
                  onChange={(e) => updateTimeSlot(i, "time", e.target.value)}
                  className={inputClass}
                  placeholder="6:30 PM"
                />
              </div>
              <button
                type="button"
                onClick={() => removeTimeSlot(i)}
                className="self-start sm:mt-3 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ticketing — moved below time section as requested */}
      {isEvent && (
        <div className="border border-charcoal/10 p-5 space-y-5">
          <div className={sectionHeader}>Online Ticketing</div>
          <p className="text-xs text-muted -mt-3">Set price and capacity to enable online ticket sales via Square.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Ticket Price ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.ticket_price_dollars}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setForm({ ...form, ticket_price_dollars: val });
                  }}
                  className={`${inputClass} pl-7`}
                  placeholder="20 or 16.50"
                />
              </div>
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

          {/* Ticket Tiers */}
          <div className="border-t border-charcoal/10 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className={labelClass + " mb-0"}>Ticket Tiers</label>
              <button type="button" onClick={addTicketTier} className={addBtn}>+ Add Tier</button>
            </div>
            {ticketTiers.length === 0 && (
              <p className="text-xs text-muted">Add tiers like VIP, GA, etc. with different prices.</p>
            )}
            {ticketTiers.map((tier, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                <div className="sm:w-32">
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateTicketTier(i, "name", e.target.value)}
                    className={inputClass}
                    placeholder="Tier (e.g., VIP)"
                  />
                </div>
                <div className="sm:w-28">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={tier.price_dollars}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        updateTicketTier(i, "price_dollars", val);
                      }}
                      className={`${inputClass} pl-7`}
                      placeholder="50"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={tier.description}
                    onChange={(e) => updateTicketTier(i, "description", e.target.value)}
                    className={inputClass}
                    placeholder="Description (e.g., Front row + meet & greet)"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTicketTier(i)}
                  className="self-start sm:mt-3 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
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
            <div className={sectionHeader}>Lineup</div>
            <button type="button" onClick={addLineupEntry} className={addBtn}>+ Add Performer</button>
          </div>
          {lineup.length === 0 && (
            <p className="text-xs text-muted">No lineup entries yet. Click &quot;Add Performer&quot; to add acts to this show.</p>
          )}
          {lineup.map((entry, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={entry.name}
                  onChange={(e) => updateLineupEntry(i, "name", e.target.value)}
                  className={inputClass}
                  placeholder="Performer name"
                />
              </div>
              <div className="sm:w-40">
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
                className="self-start sm:mt-3 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Event Categories / Genres (checkboxes) */}
      {isEvent && (
        <div className="border border-charcoal/10 p-5 space-y-4">
          <div className={sectionHeader}>Event Categories</div>
          <p className="text-xs text-muted -mt-2">Select all categories that apply. Manage categories in the Show Genres admin page.</p>
          {genres.length === 0 ? (
            <p className="text-xs text-muted italic">No genres found. Create genres in the Show Genres admin page first.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {genres.map((genre) => (
                <label
                  key={genre.id}
                  className="flex items-center gap-2 text-sm text-charcoal cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedGenreIds.includes(genre.id)}
                    onChange={() => toggleGenre(genre.id)}
                    className="accent-gold"
                  />
                  <span
                    className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                    style={{ backgroundColor: genre.color }}
                  />
                  {genre.name}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Taping fields (shown when event_category is live-taping) */}
      {isEvent && form.event_category === "live-taping" && (
        <div className="border border-charcoal/10 p-5 space-y-5">
          <div className={sectionHeader}>Live Taping Details</div>
          <div>
            <label className={labelClass}>Where to Watch Later</label>
            <input
              type="text"
              value={form.where_to_watch_later}
              onChange={(e) => setForm({ ...form, where_to_watch_later: e.target.value })}
              className={inputClass}
              placeholder="e.g., YouTube, Netflix, Hulu"
            />
          </div>
          <div>
            <label className={labelClass}>Audience Etiquette</label>
            <textarea
              rows={3}
              value={form.audience_etiquette}
              onChange={(e) => setForm({ ...form, audience_etiquette: e.target.value })}
              className={`${inputClass} resize-none`}
              placeholder="Special instructions for audience during taping (phones, noise, etc.)"
            />
          </div>
        </div>
      )}

      {/* Badges & Overrides (event-only) */}
      {isEvent && (
        <div className="border border-charcoal/10 p-5 space-y-5">
          <div className={sectionHeader}>Badge Overrides</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Just Announced</label>
              <select
                value={form.force_just_announced}
                onChange={(e) => setForm({ ...form, force_just_announced: e.target.value as "on" | "off" | "auto" })}
                className={inputClass}
              >
                <option value="auto">Auto (based on created date)</option>
                <option value="on">Force On</option>
                <option value="off">Force Off</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Selling Fast</label>
              <select
                value={form.selling_fast_override}
                onChange={(e) => setForm({ ...form, selling_fast_override: e.target.value as "on" | "off" | "auto" })}
                className={inputClass}
              >
                <option value="auto">Auto (based on % sold)</option>
                <option value="on">Force On</option>
                <option value="off">Force Off</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Selling Fast Threshold %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.selling_fast_threshold}
                onChange={(e) => setForm({ ...form, selling_fast_threshold: e.target.value })}
                className={inputClass}
                placeholder="Default: 70"
              />
              <p className="text-xs text-muted mt-1">Override the site-wide default for this event.</p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar & Seating */}
      {isEvent && (
        <div className="border border-charcoal/10 p-5 space-y-5">
          <div className={sectionHeader}>Calendar & Seating</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Duration — Hours</label>
              <select
                value={form.duration_hours}
                onChange={(e) => setForm({ ...form, duration_hours: e.target.value })}
                className={inputClass}
              >
                <option value="">—</option>
                {Array.from({ length: 13 }, (_, i) => (
                  <option key={i} value={i.toString()}>{i} hr</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Duration — Minutes</label>
              <select
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                className={inputClass}
              >
                <option value="">—</option>
                <option value="0">0 min</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Calendar Description</label>
              <input
                type="text"
                value={form.calendar_description}
                onChange={(e) => setForm({ ...form, calendar_description: e.target.value })}
                className={inputClass}
                placeholder="Custom text for calendar entries"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Table Preferences (JSON array)</label>
            <input
              type="text"
              value={form.table_preferences}
              onChange={(e) => setForm({ ...form, table_preferences: e.target.value })}
              className={inputClass}
              placeholder='["Front Row", "Near Stage", "Back / Quieter", "No Preference"]'
            />
            <p className="text-xs text-muted mt-1">JSON array of seating options shown during checkout.</p>
          </div>
        </div>
      )}

      {/* Custom URL Slug */}
      {isEvent && (
        <div className="border border-charcoal/10 p-5 space-y-4">
          <div className={sectionHeader}>Custom URL</div>
          <div>
            <label className={labelClass}>URL Slug</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                  setForm({ ...form, slug: val });
                }}
                className={inputClass}
                placeholder="halloween"
              />
              <button
                type="button"
                onClick={suggestSlug}
                className="flex-shrink-0 px-3 py-2 border border-charcoal/10 text-xs text-muted hover:border-gold/40 hover:text-charcoal transition-colors"
              >
                Auto
              </button>
            </div>
            {form.slug && (
              <p className="text-xs text-muted mt-1">
                madhattercomedy.com/<span className="text-charcoal font-medium">{form.slug}</span>
              </p>
            )}
            <p className="text-xs text-muted mt-1">Optional. Creates a short URL for this event. Lowercase letters, numbers, and hyphens only.</p>
          </div>
        </div>
      )}

      {/* Image / Media */}
      <MediaUpload
        label="Event Image"
        value={form.image_url}
        onChange={(url) => setForm({ ...form, image_url: url })}
        folder="events"
        hint="Recommended: 1200 × 630 px · PNG or JPEG · Max 100 MB"
      />

      {/* Event-only toggles */}
      {isEvent && (
        <div className="flex flex-wrap gap-6">
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
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_rsvp}
              onChange={(e) => setForm({ ...form, is_rsvp: e.target.checked })}
              className="accent-gold"
            />
            RSVP Event (no ticket purchase)
          </label>
        </div>
      )}

      {error && <p className="text-sm" style={{ color: "#9C4A38" }}>{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-1 py-3 bg-charcoal text-off-white font-bold hover:bg-charcoal-2 disabled:opacity-50 transition-colors"
        >
          {status === "loading" ? "Saving..." : id ? "Update" : "Create"}
        </button>
        <div className="flex gap-3">
          {id && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 sm:flex-none px-6 py-3 border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 sm:flex-none px-6 py-3 border border-charcoal/10 text-muted hover:text-charcoal transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
