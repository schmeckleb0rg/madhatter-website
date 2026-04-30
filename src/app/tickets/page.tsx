import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import InquiryForm from "@/components/InquiryForm";

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
  const events = await getUpcomingEvents();

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-club-red text-xs font-bold tracking-widest uppercase mb-3">
            Join Us
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Request Tickets
          </h1>
          <p className="mt-4 text-gray-500">
            Fill out the form below and we&apos;ll be in touch to confirm your reservation.
          </p>
          <div className="mt-4 text-club-gold tracking-widest opacity-30">♠ ♥ ♣ ♦</div>
        </div>

        <div className="bg-club-card border border-club-border rounded-lg p-6 sm:p-8">
          <Suspense fallback={<div className="text-gray-500 text-sm">Loading form...</div>}>
            <InquiryForm events={events} />
          </Suspense>
        </div>

        {/* Info */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="bg-club-card border border-club-border rounded p-4">
            <div className="text-club-gold mb-2">📍 Location</div>
            <p>123 W Madison St</p>
            <p>Chicago, IL 60602</p>
          </div>
          <div className="bg-club-card border border-club-border rounded p-4">
            <div className="text-club-gold mb-2">📧 Questions?</div>
            <a href="mailto:hello@madhattercomedy.com" className="hover:text-white transition-colors">
              hello@madhattercomedy.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
