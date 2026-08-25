export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import MarkReadButton from "./MarkReadButton";

async function getInquiries() {
  const db = getAdminClient();
  const { data } = await db
    .from("private_event_inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function PrivateInquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-charcoal font-display">
            Private Event Inquiries
          </h1>
          <p className="text-sm text-muted mt-1">
            {inquiries.filter((i) => !i.is_read).length} unread of {inquiries.length} total
          </p>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-20 text-muted">No private event inquiries yet.</div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`bg-white border p-4 sm:p-5 ${
                inquiry.is_read ? "border-charcoal/10" : "border-gold/30 bg-gold/5"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-charcoal">{inquiry.name}</span>
                    {!inquiry.is_read && (
                      <span className="text-xs px-2 py-0.5 bg-gold/10 text-gold font-mono">New</span>
                    )}
                    {inquiry.event_type && (
                      <span className="text-xs px-2 py-0.5 bg-off-white-2 border border-charcoal/10 text-muted">
                        {inquiry.event_type}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted space-y-1">
                    <p>
                      <a href={`mailto:${inquiry.email}`} className="hover:text-charcoal">{inquiry.email}</a>
                      {inquiry.phone && <span className="ml-3">{inquiry.phone}</span>}
                    </p>
                    {inquiry.company && <p>Company: {inquiry.company}</p>}
                    <div className="flex gap-4">
                      {inquiry.guest_count && <span>Guests: {inquiry.guest_count}</span>}
                      {inquiry.preferred_date && <span>Date: {inquiry.preferred_date}</span>}
                      {inquiry.budget_range && <span>Budget: {inquiry.budget_range}</span>}
                    </div>
                  </div>
                  {inquiry.message && (
                    <p className="text-sm text-muted mt-3 whitespace-pre-wrap">{inquiry.message}</p>
                  )}
                  <p className="text-xs text-muted/60 mt-2">
                    {new Date(inquiry.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                    })}
                  </p>
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
