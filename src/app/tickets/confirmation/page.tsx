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
      <div className="pt-24 pb-20 min-h-screen">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🎩</div>
          <h1 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            No order found
          </h1>
          <p className="text-gray-500 mb-6">This confirmation link appears to be invalid.</p>
          <Link href="/events" className="text-club-gold hover:text-white transition-colors text-sm">
            Browse upcoming shows →
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
      <div className="pt-24 pb-20 min-h-screen">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🎩</div>
          <h1 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Order not found
          </h1>
          <p className="text-gray-500 mb-6">We couldn&apos;t find this order. If you just completed a purchase, it may take a moment to process.</p>
          <Link href="/events" className="text-club-gold hover:text-white transition-colors text-sm">
            Browse upcoming shows →
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
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎉</div>
          <h1
            className="text-3xl sm:text-4xl font-black text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            You&apos;re In!
          </h1>
          <p className="mt-3 text-gray-400">
            Your tickets have been confirmed. Check your email for a receipt from Stripe.
          </p>
          <div className="mt-4 text-club-gold tracking-widest opacity-30">♠ ♥ ♣ ♦</div>
        </div>

        {/* Order summary */}
        <div className="bg-club-card border border-club-border rounded-lg p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Event</span>
              <span className="text-white font-semibold">{eventTitle}</span>
            </div>
            {eventDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="text-white">{eventDate}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Tickets</span>
              <span className="text-white">{order.quantity}</span>
            </div>
            <div className="flex justify-between border-t border-club-border pt-3">
              <span className="text-gray-500">Total Paid</span>
              <span className="text-white font-bold text-lg">{amountDisplay}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/events"
            className="inline-block px-6 py-3 bg-club-red text-white font-semibold rounded hover:bg-red-700 transition-colors"
          >
            Browse More Shows
          </Link>
        </div>
      </div>
    </div>
  );
}
