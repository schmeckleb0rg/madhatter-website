export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { TicketInquiry } from "@/lib/supabase";
import MarkReadButton from "./MarkReadButton";

async function getInquiries(): Promise<TicketInquiry[]> {
  const db = getAdminClient();
  const { data } = await db
    .from("ticket_inquiries")
    .select("*, events(title, date)")
    .order("created_at", { ascending: false });
  return (data as TicketInquiry[]) ?? [];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries();
  const unread = inquiries.filter((i) => !i.is_read).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
            Ticket Inquiries
          </h1>
          {unread > 0 && (
            <p className="text-sm text-yellow-400 mt-1">{unread} unread</p>
          )}
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-20 text-gray-600">No inquiries yet.</div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`bg-club-card border rounded-lg p-5 ${
                !inquiry.is_read ? "border-club-gold/40" : "border-club-border"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    {!inquiry.is_read && (
                      <span className="w-2 h-2 rounded-full bg-club-gold flex-shrink-0" />
                    )}
                    <span className="font-semibold text-white">{inquiry.name}</span>
                    <span className="text-sm text-gray-500">{inquiry.party_size} {inquiry.party_size === 1 ? "guest" : "guests"}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 mb-2">
                    <a href={`mailto:${inquiry.email}`} className="hover:text-white transition-colors">
                      {inquiry.email}
                    </a>
                    {inquiry.phone && <span>{inquiry.phone}</span>}
                  </div>
                  {inquiry.events && (
                    <div className="text-xs text-club-gold mb-2">
                      {inquiry.events.title} — {new Date(inquiry.events.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  )}
                  {inquiry.message && (
                    <p className="text-sm text-gray-500 leading-relaxed">{inquiry.message}</p>
                  )}
                  <p className="text-xs text-gray-700 mt-2">{formatDate(inquiry.created_at)}</p>
                </div>
                {!inquiry.is_read && <MarkReadButton id={inquiry.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
