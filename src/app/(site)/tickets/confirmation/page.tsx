import { getAdminClient } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Confirmed | Mad Hatter Comedy Club",
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-off-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h1 className="font-display text-2xl font-semibold text-charcoal mb-4">
            No order found
          </h1>
          <p className="text-muted mb-6">This confirmation link appears to be invalid.</p>
          <Link href="/events" className="text-gold hover:text-charcoal transition-colors text-sm">
            Browse upcoming shows
          </Link>
        </div>
      </div>
    );
  }

  const db = getAdminClient();
  const { data: order } = await db
    .from("orders")
    .select("*, events(title, date)")
    .eq("stripe_checkout_session_id", session_id)
    .single();

  if (!order) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-off-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h1 className="font-display text-2xl font-semibold text-charcoal mb-4">
            Order not found
          </h1>
          <p className="text-muted mb-6">We couldn&apos;t find this order. If you just completed a purchase, it may take a moment to process.</p>
          <Link href="/events" className="text-gold hover:text-charcoal transition-colors text-sm">
            Browse upcoming shows
          </Link>
        </div>
      </div>
    );
  }

  const eventTitle = order.events?.title ?? "Unknown Event";
  const eventDate = order.events?.date
    ? new Date(order.events.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const amountDisplay = `$${(order.amount_cents / 100).toFixed(2)}`;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-off-white">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
            Confirmed
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal">
            You&apos;re In!
          </h1>
          <p className="mt-3 text-muted">
            Your tickets have been confirmed. Check your email for a receipt from Stripe.
          </p>
          <div className="w-16 h-0.5 bg-gold mt-4 mx-auto" />
        </div>

        {/* Order summary */}
        <div className="bg-white border border-charcoal/10 p-6">
          <h2 className="font-mono text-xs font-medium text-muted uppercase tracking-wide mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Event</span>
              <span className="text-charcoal font-semibold">{eventTitle}</span>
            </div>
            {eventDate && (
              <div className="flex justify-between">
                <span className="text-muted">Date</span>
                <span className="text-charcoal font-mono">{eventDate}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Tickets</span>
              <span className="text-charcoal">{order.quantity}</span>
            </div>
            <div className="flex justify-between border-t border-charcoal/10 pt-3">
              <span className="text-muted">Total Paid</span>
              <span className="text-charcoal font-bold text-lg">{amountDisplay}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/events"
            className="inline-block px-6 py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 transition-colors"
          >
            Browse More Shows
          </Link>
        </div>
      </div>
    </div>
  );
}
