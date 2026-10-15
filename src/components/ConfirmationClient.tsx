"use client";

import Link from "next/link";
import ShareBar from "@/components/ShareBar";
import AddToCalendar from "@/components/AddToCalendar";

type ConfirmationClientProps = {
  eventTitle: string;
  eventDate: string;
  eventShowTime: string;
  eventDoorsTime: string;
  eventId: string;
  ctaText: string;
};

export default function ConfirmationClient({
  eventTitle,
  eventDate,
  eventShowTime,
  eventDoorsTime,
  eventId,
  ctaText,
}: ConfirmationClientProps) {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const eventUrl = eventId ? `${siteUrl}/events/${eventId}` : `${siteUrl}/events`;

  return (
    <div className="space-y-6">
      {/* Add to Calendar + Share */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {eventDate && (
          <AddToCalendar
            title={eventTitle}
            date={eventDate}
            location="Mad Hatter Comedy Club, 1046 W Kinzie St, Chicago, IL 60642"
            doorsTime={eventDoorsTime || undefined}
            eventUrl={eventUrl}
          />
        )}
        <ShareBar
          url={eventUrl}
          title={`I'm going to see ${eventTitle} at Mad Hatter Comedy Club!`}
          description={eventShowTime ? `Show at ${eventShowTime}` : undefined}
        />
      </div>

      {/* Print ticket */}
      <button
        onClick={() => window.print()}
        className="w-full py-3 border border-charcoal/10 dark:border-gold/10 text-sm text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] hover:border-charcoal/20 dark:hover:border-gold/20 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
        </svg>
        Print Ticket
      </button>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          href="/events"
          className="inline-block px-6 py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 transition-colors btn-shimmer dark:bg-gold dark:text-[#0D0C0A] dark:hover:bg-[#D4A84B]"
        >
          {ctaText}
        </Link>
      </div>
    </div>
  );
}
