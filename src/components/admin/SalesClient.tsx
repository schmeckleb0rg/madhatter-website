"use client";

import { useState, useEffect, useCallback } from "react";
import { downloadCsv } from "@/components/admin/ExportCsvButton";

type GuestEntry = {
  name: string | null;
  email: string;
  quantity: number;
  amount_cents: number;
  created_at: string;
  table_preference: string | null;
  is_member: boolean;
};

type SalesData = {
  overview: {
    totalRevenueCents: number;
    ticketRevenueCents: number;
    merchRevenueCents: number;
    totalOrders: number;
    totalTicketsSold: number;
    avgOrderCents: number;
  };
  ticketsByEvent: {
    eventId: string;
    title: string;
    date: string;
    ticketsSold: number;
    revenueCents: number;
    capacity: number | null;
    guestList: GuestEntry[];
  }[];
  merchByItem: {
    itemId: string;
    name: string;
    unitsSold: number;
    revenueCents: number;
  }[];
  giftCards: {
    totalIssuedCents: number;
    totalRedeemedCents: number;
    outstandingCents: number;
    activeCount: number;
    voidedCount: number;
    pendingCount: number;
  };
  revenueByDay: {
    date: string;
    ticketCents: number;
    merchCents: number;
  }[];
};

type Tab = "events" | "merch" | "giftcards" | "daily";

function fmt(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** Raw decimal for CSV export — spreadsheet-friendly (no $ symbol) */
function rawDollars(cents: number) {
  return (cents / 100).toFixed(2);
}

export default function SalesClient() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "all">("all");
  const [tab, setTab] = useState<Tab>("events");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (range !== "all") {
      const now = new Date();
      const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
      const from = new Date(now.getTime() - days * 86400000).toISOString();
      params.set("from", from);
    }
    try {
      const res = await fetch(`/api/admin/sales?${params}`);
      if (res.ok) {
        setData(await res.json());
      } else {
        const body = await res.json().catch(() => null);
        setError(body?.error || `Error ${res.status}`);
      }
    } catch {
      setError("Network error — could not reach server.");
    }
    setLoading(false);
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !data) {
    return <div className="text-center py-20 text-muted text-sm">Loading sales data...</div>;
  }

  if (error && !data) {
    return <div className="text-center py-20 text-muted text-sm">Failed to load sales data: {error}</div>;
  }

  if (!data) {
    return <div className="text-center py-20 text-muted text-sm">No data available.</div>;
  }

  const { overview } = data;

  function exportEvents() {
    const header = ["Event", "Date", "Tickets Sold", "Capacity", "% Sold", "Revenue"];
    const rows = data!.ticketsByEvent.map((e) => {
      const pct = e.capacity ? Math.round((e.ticketsSold / e.capacity) * 100) : null;
      return [
        e.title,
        e.date ? new Date(e.date + "T12:00:00").toLocaleDateString("en-US") : "",
        String(e.ticketsSold),
        e.capacity != null ? String(e.capacity) : "",
        pct != null ? `${pct}%` : "",
        rawDollars(e.revenueCents),
      ];
    });
    downloadCsv("ticket-sales.csv", [header, ...rows]);
  }

  function exportEventGuests(eventTitle: string, guests: GuestEntry[]) {
    const header = ["Name", "Email", "Quantity", "Amount", "Table Preference", "Member", "Date"];
    const rows = guests.map((g) => [
      g.name || "",
      g.email,
      String(g.quantity),
      g.amount_cents > 0 ? rawDollars(g.amount_cents) : "0.00",
      g.table_preference || "",
      g.is_member ? "Yes" : "No",
      new Date(g.created_at).toLocaleDateString("en-US"),
    ]);
    const safeName = eventTitle.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    downloadCsv(`attendees-${safeName}.csv`, [header, ...rows]);
  }

  function exportMerch() {
    const header = ["Item", "Units Sold", "Revenue", "Avg Price Per Unit"];
    const rows = data!.merchByItem.map((m) => [
      m.name,
      String(m.unitsSold),
      rawDollars(m.revenueCents),
      m.unitsSold > 0 ? rawDollars(Math.round(m.revenueCents / m.unitsSold)) : "0.00",
    ]);
    downloadCsv("merch-sales.csv", [header, ...rows]);
  }

  function exportGiftCards() {
    const gc = data!.giftCards;
    const header = ["Metric", "Value"];
    const rows = [
      ["Total Issued", rawDollars(gc.totalIssuedCents)],
      ["Total Redeemed", rawDollars(gc.totalRedeemedCents)],
      ["Outstanding Balance", rawDollars(gc.outstandingCents)],
      ["Active Cards", String(gc.activeCount)],
      ["Voided Cards", String(gc.voidedCount)],
      ["Pending Activation", String(gc.pendingCount)],
    ];
    downloadCsv("gift-card-summary.csv", [header, ...rows]);
  }

  function exportDaily() {
    const header = ["Date", "Ticket Revenue", "Merch Revenue", "Total"];
    const rows = data!.revenueByDay.map((d) => [
      d.date,
      rawDollars(d.ticketCents),
      rawDollars(d.merchCents),
      rawDollars(d.ticketCents + d.merchCents),
    ]);
    downloadCsv("daily-revenue.csv", [header, ...rows]);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "events", label: "Events" },
    { key: "merch", label: "Merch" },
    { key: "giftcards", label: "Gift Cards" },
    { key: "daily", label: "Daily Revenue" },
  ];

  return (
    <div className="space-y-8">
      {/* Date range filter */}
      <div className="flex flex-wrap items-center gap-2">
        {(["7d", "30d", "90d", "all"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              range === r
                ? "bg-charcoal text-off-white"
                : "bg-white border border-charcoal/10 text-muted hover:text-charcoal"
            }`}
          >
            {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : r === "90d" ? "90 Days" : "All Time"}
          </button>
        ))}
        {loading && (
          <span className="text-xs text-muted ml-2">Updating...</span>
        )}
      </div>

      {/* Overview tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Tile label="Total Revenue" value={fmt(overview.totalRevenueCents)} highlight />
        <Tile label="Ticket Revenue" value={fmt(overview.ticketRevenueCents)} />
        <Tile label="Merch Revenue" value={fmt(overview.merchRevenueCents)} />
        <Tile label="Tickets Sold" value={String(overview.totalTicketsSold)} />
        <Tile label="Total Orders" value={String(overview.totalOrders)} />
        <Tile label="Avg Order" value={fmt(overview.avgOrderCents)} />
      </div>

      {/* Tabs */}
      <div className="flex border border-charcoal/10 divide-x divide-charcoal/10 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setExpandedEvent(null); }}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.key
                ? "bg-charcoal text-off-white"
                : "bg-white text-muted hover:text-charcoal"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "events" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
              Ticket Sales by Event ({data.ticketsByEvent.length})
            </h3>
            {data.ticketsByEvent.length > 0 && (
              <button onClick={exportEvents} aria-label="Export ticket sales as CSV" className="text-xs px-4 py-1.5 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors">
                Export CSV
              </button>
            )}
          </div>
          {data.ticketsByEvent.length === 0 ? (
            <div className="text-center py-12 text-muted text-sm">No ticket sales in this period.</div>
          ) : (
            <div className="space-y-1">
              {data.ticketsByEvent.map((event) => {
                const pct = event.capacity ? Math.round((event.ticketsSold / event.capacity) * 100) : null;
                const isExpanded = expandedEvent === event.eventId;
                return (
                  <div key={event.eventId}>
                    <button
                      onClick={() => setExpandedEvent(isExpanded ? null : event.eventId)}
                      className={`w-full text-left flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border px-4 sm:px-5 py-3 sm:py-4 transition-colors gap-2 ${
                        isExpanded ? "border-gold/40 bg-off-white-2" : "border-charcoal/10 hover:border-gold/30"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-charcoal truncate">{event.title}</div>
                        <div className="text-xs text-muted">
                          {event.date ? new Date(event.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                        <span className="text-xs px-2 py-0.5 bg-off-white-2 border border-charcoal/10 text-muted">
                          {event.ticketsSold}{event.capacity != null ? `/${event.capacity}` : ""} sold
                          {pct != null && ` (${pct}%)`}
                        </span>
                        <span className="text-sm font-semibold text-charcoal">{fmt(event.revenueCents)}</span>
                        <span className={`text-sm transition-transform ${isExpanded ? "rotate-90" : ""}`}>&rarr;</span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border border-t-0 border-charcoal/10 bg-off-white-2 px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-mono text-xs uppercase tracking-widest text-muted">
                            Attendees ({event.guestList.length})
                          </h4>
                          {event.guestList.length > 0 && (
                            <button
                              onClick={() => exportEventGuests(event.title, event.guestList)}
                              aria-label={`Export attendees for ${event.title} as CSV`}
                              className="text-xs px-3 py-1 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors"
                            >
                              Export CSV
                            </button>
                          )}
                        </div>
                        {event.guestList.length === 0 ? (
                          <p className="text-sm text-muted italic">No attendees yet.</p>
                        ) : (
                          <div className="bg-white border border-charcoal/10 overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-charcoal/10">
                                  <th className="text-left px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Name</th>
                                  <th className="text-left px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Email</th>
                                  <th className="text-center px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Qty</th>
                                  <th className="text-right px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Amount</th>
                                  <th className="text-left px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Table</th>
                                  <th className="text-right px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {event.guestList.map((g, i) => (
                                  <tr key={`${g.email}-${g.created_at}-${i}`} className="border-b border-charcoal/5 last:border-0">
                                    <td className="px-3 py-2 text-charcoal">
                                      {g.name || "—"}
                                      {g.is_member && <span className="ml-1 text-xs text-gold" title="Member">*</span>}
                                    </td>
                                    <td className="px-3 py-2 text-muted">{g.email}</td>
                                    <td className="px-3 py-2 text-center text-charcoal">{g.quantity}</td>
                                    <td className="px-3 py-2 text-right text-charcoal font-mono">
                                      {g.amount_cents > 0 ? fmt(g.amount_cents) : "RSVP"}
                                    </td>
                                    <td className="px-3 py-2 text-muted text-xs">{g.table_preference || "—"}</td>
                                    <td className="px-3 py-2 text-right text-muted text-xs">
                                      {new Date(g.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "merch" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
              Merch Sales ({data.merchByItem.length})
            </h3>
            {data.merchByItem.length > 0 && (
              <button onClick={exportMerch} aria-label="Export merch sales as CSV" className="text-xs px-4 py-1.5 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors">
                Export CSV
              </button>
            )}
          </div>
          {data.merchByItem.length === 0 ? (
            <div className="text-center py-12 text-muted text-sm">No merch sales in this period.</div>
          ) : (
            <div className="bg-white border border-charcoal/10 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal/10">
                    <th className="text-left px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Item</th>
                    <th className="text-center px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Units Sold</th>
                    <th className="text-right px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Revenue</th>
                    <th className="text-right px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Avg/Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.merchByItem.map((item) => (
                    <tr key={item.itemId} className="border-b border-charcoal/5 last:border-0">
                      <td className="px-3 py-2 text-charcoal font-medium">{item.name}</td>
                      <td className="px-3 py-2 text-center text-charcoal">{item.unitsSold}</td>
                      <td className="px-3 py-2 text-right text-charcoal font-mono">{fmt(item.revenueCents)}</td>
                      <td className="px-3 py-2 text-right text-muted font-mono text-xs">
                        {item.unitsSold > 0 ? fmt(Math.round(item.revenueCents / item.unitsSold)) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "giftcards" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
              Gift Card Summary
            </h3>
            <button onClick={exportGiftCards} aria-label="Export gift card summary as CSV" className="text-xs px-4 py-1.5 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors">
              Export CSV
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Tile label="Total Issued" value={fmt(data.giftCards.totalIssuedCents)} />
            <Tile label="Total Redeemed" value={fmt(data.giftCards.totalRedeemedCents)} />
            <Tile label="Outstanding Balance" value={fmt(data.giftCards.outstandingCents)} highlight />
            <Tile label="Active Cards" value={String(data.giftCards.activeCount)} />
            <Tile label="Voided" value={String(data.giftCards.voidedCount)} />
            <Tile label="Pending Activation" value={String(data.giftCards.pendingCount)} />
          </div>
        </div>
      )}

      {tab === "daily" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
              Daily Revenue ({data.revenueByDay.length} days)
            </h3>
            {data.revenueByDay.length > 0 && (
              <button onClick={exportDaily} aria-label="Export daily revenue as CSV" className="text-xs px-4 py-1.5 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors">
                Export CSV
              </button>
            )}
          </div>
          {data.revenueByDay.length === 0 ? (
            <div className="text-center py-12 text-muted text-sm">No revenue data in this period.</div>
          ) : (
            <div className="bg-white border border-charcoal/10 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal/10">
                    <th className="text-left px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Date</th>
                    <th className="text-right px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Tickets</th>
                    <th className="text-right px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Merch</th>
                    <th className="text-right px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.revenueByDay.map((day) => (
                    <tr key={day.date} className="border-b border-charcoal/5 last:border-0">
                      <td className="px-3 py-2 text-charcoal">
                        {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-3 py-2 text-right text-charcoal font-mono">{fmt(day.ticketCents)}</td>
                      <td className="px-3 py-2 text-right text-charcoal font-mono">{fmt(day.merchCents)}</td>
                      <td className="px-3 py-2 text-right text-charcoal font-mono font-semibold">
                        {fmt(day.ticketCents + day.merchCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white border border-charcoal/10 p-3 text-center">
      <div className="text-xs text-muted uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-lg font-bold ${highlight ? "text-gold" : "text-charcoal"}`}>{value}</div>
    </div>
  );
}
