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
          <h1 className="text-2xl font-bold text-charcoal font-display">
            Ticket Inquiries
          </h1>
          {unread > 0 && (
            <p className="text-sm text-gold mt-1">{unread} unread</p>
          )}
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-20 text-muted">No inquiries yet.</div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`bg-white border p-5 ${
                !inquiry.is_read ? "border-gold/40" : "border-charcoal/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    {!inquiry.is_read && (
                      <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                    )}
                    <span className="font-semibold text-charcoal">{inquiry.name}</span>
                    <span className="text-sm text-muted">{inquiry.party_size} {inquiry.party_size === 1 ? "guest" : "guests"}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted mb-2">
                    <a href={`mailto:${inquiry.email}`} className="hover:text-charcoal transition-colors">
                      {inquiry.email}
                    </a>
                    {inquiry.phone && <span>{inquiry.phone}</span>}
                  </div>
                  {inquiry.events && (
                    <div className="text-xs text-gold mb-2">
                      {inquiry.events.title} — {new Date(inquiry.events.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  )}
                  {inquiry.message && (
                    <p className="text-sm text-muted leading-relaxed">{inquiry.message}</p>
                  )}
                  <p className="text-xs text-muted mt-2">{formatDate(inquiry.created_at)}</p>
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
