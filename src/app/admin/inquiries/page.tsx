export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { TicketInquiry } from "@/lib/supabase";
import InquiriesList from "./InquiriesList";

async function getInquiries(): Promise<TicketInquiry[]> {
  const db = getAdminClient();
  const { data } = await db
    .from("ticket_inquiries")
    .select("*, events(title, date)")
    .order("created_at", { ascending: false });
  return (data as TicketInquiry[]) ?? [];
}

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-charcoal font-display">
          Ticket Inquiries
        </h1>
      </div>

      <InquiriesList inquiries={inquiries} />
    </div>
  );
}
