export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import Link from "next/link";

async function getStats() {
  const db = getAdminClient();
  const [{ count: eventCount }, { count: pastCount }, { count: inquiryCount }, { count: unreadCount }] =
    await Promise.all([
      db.from("events").select("*", { count: "exact", head: true }).gte("date", new Date().toISOString()),
      db.from("past_events").select("*", { count: "exact", head: true }),
      db.from("ticket_inquiries").select("*", { count: "exact", head: true }),
      db.from("ticket_inquiries").select("*", { count: "exact", head: true }).eq("is_read", false),
    ]);
  return { eventCount, pastCount, inquiryCount, unreadCount };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const tiles = [
    { label: "Upcoming Shows", value: stats.eventCount ?? 0, href: "/admin/events", color: "text-club-red" },
    { label: "Past Shows", value: stats.pastCount ?? 0, href: "/admin/past-events", color: "text-club-gold" },
    { label: "Total Inquiries", value: stats.inquiryCount ?? 0, href: "/admin/inquiries", color: "text-blue-400" },
    { label: "Unread Inquiries", value: stats.unreadCount ?? 0, href: "/admin/inquiries", color: "text-yellow-400" },
  ];

  const quickLinks = [
    { href: "/admin/events/new", label: "Add New Event", icon: "+" },
    { href: "/admin/past-events/new", label: "Add Past Show", icon: "+" },
    { href: "/admin/inquiries", label: "View Inquiries", icon: "✉" },
    { href: "/admin/about", label: "Edit About Page", icon: "✏" },
    { href: "/admin/site", label: "Site Settings", icon: "⚙" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back to Mad Hatter Admin.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="bg-club-card border border-club-border rounded-lg p-5 hover:border-club-gold/30 transition-colors"
          >
            <div className={`text-3xl font-bold ${tile.color}`}>{tile.value}</div>
            <div className="text-xs text-gray-500 mt-1">{tile.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 bg-club-card border border-club-border rounded-lg px-5 py-4 hover:border-club-gold/30 transition-colors group"
            >
              <span className="text-club-gold text-lg">{link.icon}</span>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
