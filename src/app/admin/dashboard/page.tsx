export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import Link from "next/link";

async function getStats() {
  const db = getAdminClient();
  const [{ count: eventCount }, { count: comedianCount }, { count: pastCount }, { count: orderCount }, { count: inquiryCount }, { count: unreadCount }, { count: messageCount }, { count: unreadMessages }, { count: merchCount }, { count: galleryCount }] =
    await Promise.all([
      db.from("events").select("*", { count: "exact", head: true }).gte("date", new Date().toISOString()),
      db.from("comedians").select("*", { count: "exact", head: true }),
      db.from("past_events").select("*", { count: "exact", head: true }),
      db.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed"),
      db.from("ticket_inquiries").select("*", { count: "exact", head: true }),
      db.from("ticket_inquiries").select("*", { count: "exact", head: true }).eq("is_read", false),
      db.from("contact_messages").select("*", { count: "exact", head: true }),
      db.from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false),
      db.from("merch_items").select("*", { count: "exact", head: true }),
      db.from("gallery_images").select("*", { count: "exact", head: true }),
    ]);
  return { eventCount, comedianCount, pastCount, orderCount, inquiryCount, unreadCount, messageCount, unreadMessages, merchCount, galleryCount };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const tiles = [
    { label: "Upcoming Shows", value: stats.eventCount ?? 0, href: "/admin/events", color: "text-gold" },
    { label: "Comedians", value: stats.comedianCount ?? 0, href: "/admin/comedians", color: "text-charcoal" },
    { label: "Ticket Orders", value: stats.orderCount ?? 0, href: "/admin/orders", color: "text-charcoal" },
    { label: "Past Shows", value: stats.pastCount ?? 0, href: "/admin/past-events", color: "text-charcoal" },
    { label: "Unread Inquiries", value: stats.unreadCount ?? 0, href: "/admin/inquiries", color: "text-gold" },
    { label: "Unread Messages", value: stats.unreadMessages ?? 0, href: "/admin/messages", color: "text-gold" },
    { label: "Merch Items", value: stats.merchCount ?? 0, href: "/admin/merch", color: "text-charcoal" },
    { label: "Gallery Photos", value: stats.galleryCount ?? 0, href: "/admin/gallery", color: "text-charcoal" },
  ];

  const quickLinks = [
    { href: "/admin/events/new", label: "Add New Event", icon: "+" },
    { href: "/admin/comedians/new", label: "Add Comedian", icon: "+" },
    { href: "/admin/past-events/new", label: "Add Past Show", icon: "+" },
    { href: "/admin/merch/new", label: "Add Merch Item", icon: "+" },
    { href: "/admin/gallery", label: "Upload Photos" },
    { href: "/admin/orders", label: "View Orders" },
    { href: "/admin/inquiries", label: "View Inquiries" },
    { href: "/admin/messages", label: "View Messages" },
    { href: "/admin/about", label: "Edit About Page" },
    { href: "/admin/site", label: "Site Settings" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <h1 className="font-display text-2xl font-semibold text-charcoal">
          Dashboard
        </h1>
        <p className="text-sm text-muted mt-1">Welcome back to Mad Hatter Admin.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="bg-white border border-charcoal/10 p-5 hover:border-gold/30 transition-colors"
          >
            <div className={`text-3xl font-bold ${tile.color}`}>{tile.value}</div>
            <div className="font-mono text-xs text-muted mt-1">{tile.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="mb-6">
        <h2 className="font-mono text-xs font-medium text-muted uppercase tracking-wide mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 bg-white border border-charcoal/10 px-5 py-4 hover:border-gold/30 transition-colors group"
            >
              {"icon" in link && <span className="text-gold text-lg">{link.icon}</span>}
              <span className="text-sm text-muted group-hover:text-charcoal transition-colors">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
