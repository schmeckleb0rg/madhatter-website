"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { downloadCsv } from "@/components/admin/ExportCsvButton";

type PastShowEntry = {
  id: string;
  title: string;
  performer: string | null;
  date: string;
  image_url: string | null;
  source: "manual" | "auto";
};

type EventStats = {
  ticketsSold: number;
  ticketCapacity: number | null;
  totalRevenueCents: number;
  rsvpCount: number;
  attendeesCount: number;
  inquiryCount: number;
  guestList: { name: string | null; email: string; quantity: number; amount_cents: number; created_at: string }[];
  inquiries: { name: string; email: string; phone: string | null; party_size: number | null; message: string | null; is_read: boolean; created_at: string }[];
};

function dateOnly(d: string) {
  return d.slice(0, 10);
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateOnly(dateStr) + "T12:00:00");
  return {
    month: d.toLocaleDateString("en-US", { month: "short", timeZone: "America/Chicago" }).toUpperCase(),
    day: d.toLocaleDateString("en-US", { day: "numeric", timeZone: "America/Chicago" }),
    full: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" }),
  };
}

// Simple month calendar
function MonthCalendar({
  year,
  month,
  eventDates,
  selectedDate,
  onSelectDate,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  eventDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white border border-charcoal/10 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onPrev} className="text-muted hover:text-charcoal px-2 py-1">&larr;</button>
        <span className="font-mono text-sm text-charcoal font-medium">{monthName}</span>
        <button onClick={onNext} className="text-muted hover:text-charcoal px-2 py-1">&rarr;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-[10px] text-muted font-mono py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasEvent = eventDates.has(dateStr);
          const isSelected = selectedDate === dateStr;
          return (
            <button
              key={dateStr}
              onClick={() => hasEvent ? onSelectDate(isSelected ? null : dateStr) : undefined}
              className={`
                text-xs py-1.5 relative transition-colors
                ${hasEvent ? "font-bold cursor-pointer" : "text-muted/40 cursor-default"}
                ${isSelected ? "bg-gold/20 text-charcoal" : hasEvent ? "text-charcoal hover:bg-off-white-2" : ""}
              `}
            >
              {day}
              {hasEvent && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      {selectedDate && (
        <button
          onClick={() => onSelectDate(null)}
          className="mt-2 text-xs text-muted hover:text-charcoal"
        >
          Clear date filter
        </button>
      )}
    </div>
  );
}

function StatsPanel({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/events/${eventId}/stats`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load stats");
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div className="p-4 text-sm text-muted">Loading stats...</div>;
  if (error) return <div className="p-4 text-sm text-red-600">{error}</div>;
  if (!stats) return null;

  const revenue = (stats.totalRevenueCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="bg-off-white-2 border-t border-charcoal/10 p-4 sm:p-5">
      {/* Metric tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-white border border-charcoal/10 p-3">
          <div className="text-lg font-bold text-charcoal">{stats.attendeesCount}</div>
          <div className="text-[10px] font-mono text-muted uppercase">Attendees</div>
        </div>
        <div className="bg-white border border-charcoal/10 p-3">
          <div className="text-lg font-bold text-gold">{revenue}</div>
          <div className="text-[10px] font-mono text-muted uppercase">Revenue</div>
        </div>
        <div className="bg-white border border-charcoal/10 p-3">
          <div className="text-lg font-bold text-charcoal">{stats.rsvpCount}</div>
          <div className="text-[10px] font-mono text-muted uppercase">RSVPs</div>
        </div>
        <div className="bg-white border border-charcoal/10 p-3">
          <div className="text-lg font-bold text-charcoal">{stats.inquiryCount}</div>
          <div className="text-[10px] font-mono text-muted uppercase">Inquiries</div>
        </div>
      </div>

      {/* Guest list */}
      {stats.guestList.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted">Guest List</h4>
            <button
              onClick={() => {
                const header = ["Name", "Email", "Quantity", "Amount", "Date"];
                const rows = stats.guestList.map((g) => [
                  g.name || "",
                  g.email,
                  String(g.quantity),
                  (g.amount_cents / 100).toFixed(2),
                  new Date(g.created_at).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "America/Chicago" }),
                ]);
                downloadCsv("guest-list.csv", [header, ...rows]);
              }}
              className="text-[10px] px-3 py-1 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors"
            >
              Export CSV
            </button>
          </div>
          <div className="bg-white border border-charcoal/10 overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-charcoal/10">
                  <th className="text-left px-2 py-1.5 text-muted font-medium">Name</th>
                  <th className="text-left px-2 py-1.5 text-muted font-medium">Email</th>
                  <th className="text-center px-2 py-1.5 text-muted font-medium">Qty</th>
                  <th className="text-right px-2 py-1.5 text-muted font-medium">Amount</th>
                  <th className="text-right px-2 py-1.5 text-muted font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.guestList.map((g, i) => (
                  <tr key={`${g.email}-${i}`} className="border-b border-charcoal/5 last:border-0">
                    <td className="px-2 py-1.5 text-charcoal">{g.name || "—"}</td>
                    <td className="px-2 py-1.5 text-muted">{g.email}</td>
                    <td className="px-2 py-1.5 text-center">{g.quantity}</td>
                    <td className="px-2 py-1.5 text-right font-mono">
                      {g.amount_cents > 0 ? `$${(g.amount_cents / 100).toFixed(2)}` : "RSVP"}
                    </td>
                    <td className="px-2 py-1.5 text-right text-muted">
                      {new Date(g.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inquiry list */}
      {stats.inquiries.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted">Ticket Inquiries ({stats.inquiries.length})</h4>
            <button
              onClick={() => {
                const header = ["Name", "Email", "Phone", "Party Size", "Message", "Read", "Date"];
                const rows = stats.inquiries.map((inq) => [
                  inq.name,
                  inq.email,
                  inq.phone || "",
                  String(inq.party_size ?? 1),
                  inq.message || "",
                  inq.is_read ? "Yes" : "No",
                  new Date(inq.created_at).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "America/Chicago" }),
                ]);
                downloadCsv("inquiries.csv", [header, ...rows]);
              }}
              className="text-[10px] px-3 py-1 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors"
            >
              Export CSV
            </button>
          </div>
          <div className="bg-white border border-charcoal/10 overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-charcoal/10">
                  <th className="text-left px-2 py-1.5 text-muted font-medium">Name</th>
                  <th className="text-left px-2 py-1.5 text-muted font-medium">Email</th>
                  <th className="text-left px-2 py-1.5 text-muted font-medium">Phone</th>
                  <th className="text-center px-2 py-1.5 text-muted font-medium">Party</th>
                  <th className="text-left px-2 py-1.5 text-muted font-medium">Message</th>
                  <th className="text-right px-2 py-1.5 text-muted font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.inquiries.map((inq, i) => (
                  <tr key={`inq-${inq.email}-${i}`} className="border-b border-charcoal/5 last:border-0">
                    <td className="px-2 py-1.5 text-charcoal">
                      {inq.name}
                      {!inq.is_read && <span className="ml-1 w-1.5 h-1.5 bg-gold rounded-full inline-block" title="Unread" />}
                    </td>
                    <td className="px-2 py-1.5 text-muted">{inq.email}</td>
                    <td className="px-2 py-1.5 text-muted">{inq.phone || "—"}</td>
                    <td className="px-2 py-1.5 text-center">{inq.party_size ?? 1}</td>
                    <td className="px-2 py-1.5 text-muted max-w-[150px] truncate">{inq.message || "—"}</td>
                    <td className="px-2 py-1.5 text-right text-muted">
                      {new Date(inq.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats.guestList.length === 0 && stats.inquiries.length === 0 && (
        <p className="text-xs text-muted italic">No attendees or inquiries for this event.</p>
      )}

      <div className="flex items-center gap-3 mt-3">
        <Link
          href={`/admin/events/${eventId}`}
          className="text-xs px-3 py-1.5 bg-charcoal text-off-white hover:bg-charcoal-2 transition-colors"
        >
          Edit Event
        </Link>
        <button onClick={onClose} className="text-xs text-muted hover:text-charcoal transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

export default function PastShowsClient({ events }: { events: PastShowEntry[] }) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [calMonth, setCalMonth] = useState(() => {
    // Start on the most recent event's month, or current month
    if (events.length > 0) {
      const d = dateOnly(events[0].date);
      return { year: parseInt(d.slice(0, 4)), month: parseInt(d.slice(5, 7)) - 1 };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Event dates for calendar dots
  const eventDates = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(dateOnly(e.date)));
    return set;
  }, [events]);

  // Filter events
  const filtered = useMemo(() => {
    let result = events;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) => e.title.toLowerCase().includes(q) || e.performer?.toLowerCase().includes(q)
      );
    }
    if (selectedDate) {
      result = result.filter((e) => dateOnly(e.date) === selectedDate);
    }
    return result;
  }, [events, search, selectedDate]);

  const prevMonth = useCallback(() => {
    setCalMonth((p) => p.month === 0 ? { year: p.year - 1, month: 11 } : { year: p.year, month: p.month - 1 });
  }, []);

  const nextMonth = useCallback(() => {
    setCalMonth((p) => p.month === 11 ? { year: p.year + 1, month: 0 } : { year: p.year, month: p.month + 1 });
  }, []);

  return (
    <div>
      {/* Search + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search past shows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-charcoal/10 px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold/50 transition-colors pl-9"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex border border-charcoal/10 bg-white">
          <button
            onClick={() => { setViewMode("list"); setSelectedDate(null); }}
            className={`px-3 py-2 text-xs font-mono transition-colors ${viewMode === "list" ? "bg-charcoal text-off-white" : "text-muted hover:text-charcoal"}`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3 py-2 text-xs font-mono transition-colors ${viewMode === "calendar" ? "bg-charcoal text-off-white" : "text-muted hover:text-charcoal"}`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Calendar */}
      {viewMode === "calendar" && (
        <MonthCalendar
          year={calMonth.year}
          month={calMonth.month}
          eventDates={eventDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onPrev={prevMonth}
          onNext={nextMonth}
        />
      )}

      {/* Results count */}
      <p className="text-xs text-muted mb-3">
        {filtered.length} show{filtered.length !== 1 ? "s" : ""}
        {search && ` matching "${search}"`}
        {selectedDate && ` on ${new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Chicago" })}`}
      </p>

      {/* Event list */}
      <div className="space-y-2">
        {filtered.map((event) => {
          const d = formatDateShort(event.date);
          const isExpanded = expandedId === `${event.source}-${event.id}`;

          return (
            <div key={`${event.source}-${event.id}`} className="bg-white border border-charcoal/10 overflow-hidden">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4">
                {/* Thumbnail */}
                <div className="w-12 h-12 overflow-hidden flex-shrink-0 relative bg-off-white-2">
                  {event.image_url ? (
                    <Image src={event.image_url} alt={event.title} fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display text-sm text-muted/30">MH</span>
                    </div>
                  )}
                </div>

                {/* Date badge */}
                <div className="text-center w-10 flex-shrink-0">
                  <div className="text-[10px] text-gold font-bold">{d.month}</div>
                  <div className="text-lg font-bold text-charcoal leading-none">{d.day}</div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-charcoal truncate">
                    {event.title}
                    {event.source === "auto" && (
                      <span className="ml-2 text-[10px] text-gold font-normal">(from Events)</span>
                    )}
                  </div>
                  {event.performer && (
                    <div className="text-xs text-muted">{event.performer}</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {event.source === "auto" && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : `${event.source}-${event.id}`)}
                      className={`text-xs px-3 py-1.5 border transition-colors ${
                        isExpanded
                          ? "border-gold/40 text-charcoal bg-gold/5"
                          : "border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal"
                      }`}
                    >
                      {isExpanded ? "Hide" : "Stats"}
                    </button>
                  )}
                  <Link
                    href={event.source === "auto" ? `/admin/events/${event.id}` : `/admin/past-events/${event.id}`}
                    className="text-muted text-sm hover:text-charcoal transition-colors"
                  >
                    &rarr;
                  </Link>
                </div>
              </div>

              {/* Expanded stats panel */}
              {isExpanded && event.source === "auto" && (
                <StatsPanel eventId={event.id} onClose={() => setExpandedId(null)} />
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted text-sm">
            No past shows found{search ? ` matching "${search}"` : ""}.
          </div>
        )}
      </div>
    </div>
  );
}
