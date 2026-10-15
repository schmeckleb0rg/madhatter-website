import { getAdminClient, supabase } from "@/lib/supabase";
import Link from "next/link";
import QRCode from "qrcode";
import ConfirmationClient from "@/components/ConfirmationClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Confirmed | Mad Hatter Comedy Club",
};

async function getSiteSetting(key: string): Promise<string | null> {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single();
  return data?.value ?? null;
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h1 className="font-display text-2xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-4">
            No order found
          </h1>
          <p className="text-muted dark:text-[#7A7264] mb-6">This confirmation link appears to be invalid.</p>
          <Link href="/events" className="text-gold hover:text-charcoal dark:hover:text-[#F0ECE3] transition-colors text-sm">
            Browse upcoming shows
          </Link>
        </div>
      </div>
    );
  }

  const db = getAdminClient();
  const { data: order } = await db
    .from("orders")
    .select("*, events(title, date, show_time, doors_time, image_url)")
    .eq("square_order_id", session_id)
    .single();

  if (!order) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h1 className="font-display text-2xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-4">
            Order not found
          </h1>
          <p className="text-muted dark:text-[#7A7264] mb-6">
            We couldn&apos;t find this order. If you just completed a purchase, it may take a moment to process.
          </p>
          <Link href="/events" className="text-gold hover:text-charcoal dark:hover:text-[#F0ECE3] transition-colors text-sm">
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

  // Generate QR code
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const qrData = `${siteUrl}/tickets/verify?order=${order.id}`;
  let qrCodeDataUrl = "";
  try {
    qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: { dark: "#1B1A17", light: "#F6F2E9" },
    });
  } catch {
    // QR generation failed, continue without it
  }

  // Fetch admin-editable text
  const confirmationText = await getSiteSetting("confirmation_page_text") ||
    "Your tickets have been confirmed. We can't wait to see you!";
  const ctaText = await getSiteSetting("confirmation_cta_text") || "Browse More Shows";

  return (
    <div className="pt-24 pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gold/10 dark:bg-gold/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">Confirmed</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal dark:text-[#F0ECE3]">
            You&apos;re In!
          </h1>
          <p className="mt-3 text-muted dark:text-[#7A7264]">{confirmationText}</p>
          <div className="w-16 h-0.5 bg-gold mt-4 mx-auto" />
        </div>

        {/* Ticket Visual */}
        <div className="bg-white dark:bg-[#1C1A16] border-2 border-charcoal/10 dark:border-gold/10 overflow-hidden mb-6">
          {/* Ticket header strip */}
          <div className="bg-charcoal dark:bg-gold px-6 py-3 flex items-center justify-between">
            <span className="font-display text-sm text-off-white dark:text-[#0D0C0A] font-semibold tracking-wide">
              Mad Hatter
            </span>
            <span className="font-mono text-xs text-off-white/70 dark:text-[#0D0C0A]/70 uppercase tracking-wider">
              Admit {order.quantity}
            </span>
          </div>

          <div className="p-6 sm:p-8">
            {/* Event info */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted dark:text-[#7A7264]">Event</span>
                <span className="text-charcoal dark:text-[#F0ECE3] font-semibold text-right max-w-[60%]">{eventTitle}</span>
              </div>
              {eventDate && (
                <div className="flex justify-between">
                  <span className="text-muted dark:text-[#7A7264]">Date</span>
                  <span className="text-charcoal dark:text-[#F0ECE3] font-mono">{eventDate}</span>
                </div>
              )}
              {order.events?.show_time && (
                <div className="flex justify-between">
                  <span className="text-muted dark:text-[#7A7264]">Show Time</span>
                  <span className="text-charcoal dark:text-[#F0ECE3] font-mono">{order.events.show_time}</span>
                </div>
              )}
              {order.events?.doors_time && (
                <div className="flex justify-between">
                  <span className="text-muted dark:text-[#7A7264]">Doors</span>
                  <span className="text-charcoal dark:text-[#F0ECE3] font-mono">{order.events.doors_time}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted dark:text-[#7A7264]">Tickets</span>
                <span className="text-charcoal dark:text-[#F0ECE3]">{order.quantity}</span>
              </div>
              {order.table_preference && (
                <div className="flex justify-between">
                  <span className="text-muted dark:text-[#7A7264]">Table Preference</span>
                  <span className="text-charcoal dark:text-[#F0ECE3]">{order.table_preference}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-charcoal/10 dark:border-gold/10 pt-3">
                <span className="text-muted dark:text-[#7A7264]">Total Paid</span>
                <span className="text-charcoal dark:text-[#F0ECE3] font-bold text-lg">{amountDisplay}</span>
              </div>
            </div>

            {/* QR Code */}
            {qrCodeDataUrl && (
              <div className="mt-6 pt-6 border-t border-dashed border-charcoal/10 dark:border-gold/10 text-center">
                <img
                  src={qrCodeDataUrl}
                  alt="Ticket QR Code"
                  className="mx-auto w-32 h-32 dark:invert dark:brightness-90"
                />
                <p className="font-mono text-[10px] text-muted dark:text-[#7A7264] mt-2 uppercase tracking-wider">
                  Present at door
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions: Add to Calendar + Share */}
        <ConfirmationClient
          eventTitle={eventTitle}
          eventDate={order.events?.date || ""}
          eventShowTime={order.events?.show_time || ""}
          eventDoorsTime={order.events?.doors_time || ""}
          eventId={order.event_id || ""}
          ctaText={ctaText}
        />
      </div>
    </div>
  );
}
