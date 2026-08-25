import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import InquiryForm from "@/components/InquiryForm";
import { getVenueInfo } from "@/lib/venue";

export const revalidate = 60;

export const metadata = {
  title: "Request Tickets | Mad Hatter Comedy Club",
  description: "Request tickets for upcoming shows at Mad Hatter Comedy Club in Chicago.",
};

async function getUpcomingEvents() {
  const { data } = await supabase
    .from("events")
    .select("id, title, date")
    .gte("date", new Date().toISOString())
    .eq("is_sold_out", false)
    .order("date", { ascending: true });
  return data ?? [];
}

export default async function TicketsPage() {
  const [events, venue] = await Promise.all([getUpcomingEvents(), getVenueInfo()]);

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
            Join Us
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-charcoal">
            Request Tickets
          </h1>
          <p className="mt-4 text-muted">
            Fill out the form below and we&apos;ll be in touch to confirm your reservation.
          </p>
          <div className="w-16 h-0.5 bg-gold mt-4 mx-auto" />
        </div>

        <div className="bg-white border border-charcoal/10 p-6 sm:p-8">
          <Suspense fallback={<div className="text-muted text-sm">Loading form...</div>}>
            <InquiryForm events={events} />
          </Suspense>
        </div>

        {/* Info */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted">
          <div className="bg-off-white-2 border border-charcoal/10 p-4">
            <div className="font-mono text-xs tracking-widest uppercase text-gold mb-2">Location</div>
            <p>{venue.street}</p>
            <p>{venue.city}, {venue.state} {venue.zip}</p>
          </div>
          <div className="bg-off-white-2 border border-charcoal/10 p-4">
            <div className="font-mono text-xs tracking-widest uppercase text-gold mb-2">Questions?</div>
            <a href={`mailto:${venue.email}`} className="hover:text-charcoal transition-colors">
              {venue.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
