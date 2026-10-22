"use client";

import { useState } from "react";
import Link from "next/link";
import type { Event } from "@/lib/supabase";

type EventStats = {
  ticketsSold: number;
  ticketCapacity: number | null;
  totalRevenueCents: number;
  rsvpCount: number;
  attendeesCount: number;
  inquiryCount: number;
  guestList: {
    name: string | null;
    email: string;
    quantity: number;
    amount_cents: number;
    status: string;
    created_at: string;
  }[];
};

type Props = {
  events: Event[];
};

export default function EventsListAdmin({ events }: Props) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statsCache, setStatsCache] = useState<Record<string, EventStats>>({});
  const [loadingStats, setLoadingStats] = useState<string | null>(null);

  const now = new Date().toISOString();
  const searchLower = search.toLowerCase();

  const filtered = events.filter((e) => {
    // Tab filter
    const isPast = e.date < now;
    if (tab === "upcoming" && isPast) return false;
    if (tab === "past" && !isPast) return false;

    // Search filter
    if (search) {
      const matchTitle = e.title.toLowerCase().includes(searchLower);
      const matchPerformer = e.performer?.toLowerCase().includes(searchLower);
      if (!matchTitle && !matchPerformer) return false;
    }

    return true;
  });

  // Sort: upcoming = ascending (nearest first), past = descending (most recent first)
  const sorted = [...filtered].sort((a, b) => {
    if (tab === "upcoming") return a.date.localeCompare(b.date);
    return b.date.localeCompare(a.date);
  });

  async function toggleStats(eventId: string) {
    if (expandedId === eventId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(eventId);

    if (!statsCache[eventId]) {
      setLoadingStats(eventId);
      try {
        const res = await fetch(`/api/admin/events/${eventId}/stats`);
        if (res.ok) {
          const data = await res.json();
          setStatsCache((prev) => ({ ...prev, [eventId]: data }));
        }
      } catch {
        // silently fail
      }
      setLoadingStats(null);
    }
  }

  const upcomingCount = events.filter((e) => e.date >= now).length;
  const pastCount = events.filter((e) => e.date < now).length;

  return (
    <div>
      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events..."
          className="flex-1 bg-white border border-charcoal/10 px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold/50 transition-colors"
        />
        <div className="flex border border-charcoal/10 divide-x divide-charcoal/10">
          <button
            onClick={() => { setTab("upcoming"); setExpandedId(null); }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === "upcoming"
                ? "bg-charcoal text-off-white"
                : "bg-white text-muted hover:text-charcoal"
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => { setTab("past"); setExpandedId(null); }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === "past"
                ? "bg-charcoal text-off-white"
                : "bg-white text-muted hover:text-charcoal"
            }`}
          >
            Past ({pastCount})
          </button>
        </div>
      </div>

      {/* Event List */}
      {sorted.length === 0 ? (
        <div className="text-center py-20 text-muted">
          {search ? "No events match your search." : "No events found."}
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((event) => (
            <div key={event.id}>
              {/* Event Card */}
              <button
                onClick={() => toggleStats(event.id)}
                className={`w-full text-left flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border px-5 py-4 transition-colors gap-2 sm:gap-0 ${
                  expandedId === event.id
                    ? "border-gold/40 bg-off-white-2"
                    : "border-charcoal/10 hover:border-gold/30"
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="text-center w-10 flex-shrink-0">
                    <div className="text-xs text-gold font-bold">
                      {new Date(event.date).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                    </div>
                    <div className="text-xl font-bold text-charcoal leading-none">
                      {new Date(event.date).getDate()}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-charcoal truncate">{event.title}</div>
                    {event.performer && (
                      <div className="text-xs text-muted">{event.performer}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {event.is_cancelled && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 font-medium">Cancelled</span>
                  )}
                  {event.is_rsvp && !event.is_cancelled && (
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700">RSVP</span>
                  )}
                  {event.ticket_capacity && !event.is_cancelled ? (
                    <span className="text-xs px-2 py-0.5 bg-off-white-2 border border-charcoal/10 text-muted">
                      {event.tickets_sold ?? 0}/{event.ticket_capacity} sold
                    </span>
                  ) : !event.is_rsvp && !event.is_cancelled ? (
                    <span className="text-xs px-2 py-0.5 text-muted">Inquiry only</span>
                  ) : null}
                  {event.is_featured && !event.is_cancelled && (
                    <span className="text-xs px-2 py-0.5 bg-gold/10 text-gold">Featured</span>
                  )}
                  {event.is_sold_out && !event.is_cancelled && (
                    <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700">Sold Out</span>
                  )}
                  <span className={`text-sm transition-transform ${expandedId === event.id ? "rotate-90" : ""}`}>
                    &rarr;
                  </span>
                </div>
              </button>

              {/* Stats Panel */}
              {expandedId === event.id && (
                <div className="border border-t-0 border-charcoal/10 bg-off-white-2 px-5 py-5">
                  {loadingStats === event.id ? (
                    <div className="text-center py-6 text-muted text-sm">Loading stats...</div>
                  ) : statsCache[event.id] ? (
                    <StatsPanel event={event} stats={statsCache[event.id]} />
                  ) : (
                    <div className="text-center py-6 text-muted text-sm">Failed to load stats.</div>
                  )}

                  <div className="flex gap-3 mt-5 pt-4 border-t border-charcoal/10">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="px-5 py-2 bg-charcoal text-off-white text-sm font-semibold hover:bg-charcoal-2 transition-colors"
                    >
                      Edit Event
                    </Link>
                    <button
                      onClick={() => setExpandedId(null)}
                      className="px-5 py-2 border border-charcoal/10 text-sm text-muted hover:text-charcoal transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatsPanel({ event, stats }: { event: Event; stats: EventStats }) {
  const revenue = (stats.totalRevenueCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const soldPercent = stats.ticketCapacity
    ? Math.min(100, Math.round((stats.ticketsSold / stats.ticketCapacity) * 100))
    : null;

  return (
    <div className="space-y-5">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.ticketCapacity ? (
          <div className="bg-white border border-charcoal/10 p-3 text-center">
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Tickets Sold</div>
            <div className="text-lg font-bold text-charcoal">
              {stats.ticketsSold}/{stats.ticketCapacity}
            </div>
            {soldPercent !== null && (
              <div className="mt-2 h-1.5 bg-off-white-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-all"
                  style={{ width: `${soldPercent}%` }}
                />
              </div>
            )}
          </div>
        ) : event.is_rsvp ? (
          <div className="bg-white border border-charcoal/10 p-3 text-center">
            <div className="text-xs text-muted uppercase tracking-wide mb-1">RSVPs</div>
            <div className="text-lg font-bold text-charcoal">{stats.rsvpCount}</div>
          </div>
        ) : null}

        <div className="bg-white border border-charcoal/10 p-3 text-center">
          <div className="text-xs text-muted uppercase tracking-wide mb-1">Revenue</div>
          <div className="text-lg font-bold text-charcoal">{revenue}</div>
        </div>

        <div className="bg-white border border-charcoal/10 p-3 text-center">
          <div className="text-xs text-muted uppercase tracking-wide mb-1">Attendees</div>
          <div className="text-lg font-bold text-charcoal">{stats.attendeesCount}</div>
        </div>

        <div className="bg-white border border-charcoal/10 p-3 text-center">
          <div className="text-xs text-muted uppercase tracking-wide mb-1">Inquiries</div>
          <div className="text-lg font-bold text-charcoal">{stats.inquiryCount}</div>
        </div>
      </div>

      {/* Guest List */}
      {stats.guestList.length > 0 && (
        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
            Guest List ({stats.guestList.length})
          </h4>
          <div className="bg-white border border-charcoal/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal/10">
                  <th className="text-left px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Name</th>
                  <th className="text-left px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Email</th>
                  <th className="text-center px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Qty</th>
                  <th className="text-right px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Amount</th>
                  <th className="text-right px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.guestList.map((guest, i) => (
                  <tr key={i} className="border-b border-charcoal/5 last:border-0">
                    <td className="px-3 py-2 text-charcoal">{guest.name || "—"}</td>
                    <td className="px-3 py-2 text-muted">{guest.email}</td>
                    <td className="px-3 py-2 text-center text-charcoal">{guest.quantity}</td>
                    <td className="px-3 py-2 text-right text-charcoal font-mono">
                      {guest.amount_cents > 0
                        ? `$${(guest.amount_cents / 100).toFixed(2)}`
                        : "RSVP"}
                    </td>
                    <td className="px-3 py-2 text-right text-muted text-xs">
                      {new Date(guest.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats.guestList.length === 0 && (
        <p className="text-sm text-muted italic">No orders yet for this event.</p>
      )}
    </div>
  );
}
