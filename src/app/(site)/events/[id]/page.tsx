import { supabase } from "@/lib/supabase";
import type { Event } from "@/lib/supabase";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ShareBar from "@/components/ShareBar";
import AddToCalendar from "@/components/AddToCalendar";
import RSVPForm from "@/components/RSVPForm";
import { fullAddress, getVenueInfo } from "@/lib/venue";
import { EventSchema } from "@/components/StructuredData";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

async function getEvent(id: string): Promise<Event | null> {
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return { title: "Event Not Found" };

  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const title = `${event.title} | Mad Hatter Comedy Club`;
  const description = event.performer
    ? `${event.performer} — ${dateStr} at Mad Hatter Comedy Club`
    : `${dateStr} at Mad Hatter Comedy Club`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl}/events/${id}`,
      images: event.image_url
        ? [{ url: event.image_url, width: 1200, height: 630, alt: event.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: event.image_url ? [event.image_url] : undefined,
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const venue = await getVenueInfo();
  const address = fullAddress(venue);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const eventUrl = `${siteUrl}/events/${id}`;

  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const month = new Date(event.date)
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const day = new Date(event.date).getDate();

  const priceDisplay = event.ticket_price_cents
    ? `$${(event.ticket_price_cents / 100).toFixed(2)}`
    : event.ticket_price || null;

  const remaining =
    event.ticket_capacity && event.tickets_sold != null
      ? event.ticket_capacity - event.tickets_sold
      : null;

  return (
    <>
      <EventSchema event={event} />
      <div className="pt-24 pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All Events
          </Link>

          {/* Event Image */}
          {event.image_url && (
            <div className="relative aspect-[1200/630] w-full bg-off-white-2 dark:bg-[#161412] overflow-hidden mb-8">
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
              {event.is_sold_out && (
                <div className="absolute inset-0 bg-charcoal/60 dark:bg-black/70 flex items-center justify-center">
                  <span className="font-mono text-off-white font-medium text-lg tracking-widest uppercase">
                    Sold Out
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Date + Title */}
          <div className="flex gap-4 sm:gap-5 mb-6">
            <div className="flex-shrink-0 text-center w-14 sm:w-16">
              <div className="font-mono text-xs font-medium text-gold">{month}</div>
              <div className="text-3xl sm:text-4xl font-bold text-charcoal dark:text-[#F0ECE3] leading-none">
                {day}
              </div>
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal dark:text-[#F0ECE3]">
                {event.title}
              </h1>
              {event.performer && (
                <p className="text-muted dark:text-[#7A7264] mt-1">{event.performer}</p>
              )}
              <p className="text-sm text-muted dark:text-[#7A7264] mt-1">{dateStr}</p>
            </div>
          </div>

          {/* Info boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {event.doors_time && (
              <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-3 text-center">
                <div className="text-xs text-muted dark:text-[#7A7264] uppercase tracking-wide mb-1">Doors</div>
                <div className="font-mono text-sm text-charcoal dark:text-[#F0ECE3]">{event.doors_time}</div>
              </div>
            )}
            {event.show_time && (
              <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-3 text-center">
                <div className="text-xs text-muted dark:text-[#7A7264] uppercase tracking-wide mb-1">Show</div>
                <div className="font-mono text-sm text-charcoal dark:text-[#F0ECE3]">{event.show_time}</div>
              </div>
            )}
            {event.end_time && (
              <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-3 text-center">
                <div className="text-xs text-muted dark:text-[#7A7264] uppercase tracking-wide mb-1">Ends</div>
                <div className="font-mono text-sm text-charcoal dark:text-[#F0ECE3]">{event.end_time}</div>
              </div>
            )}
            {priceDisplay && (
              <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-3 text-center">
                <div className="text-xs text-muted dark:text-[#7A7264] uppercase tracking-wide mb-1">Price</div>
                <div className="font-mono text-sm text-charcoal dark:text-[#F0ECE3] font-semibold">{priceDisplay}</div>
              </div>
            )}
            {remaining !== null && (
              <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-3 text-center">
                <div className="text-xs text-muted dark:text-[#7A7264] uppercase tracking-wide mb-1">Status</div>
                <div className="font-mono text-sm text-charcoal dark:text-[#F0ECE3]">
                  {event.is_sold_out ? "Sold Out" : "Available"}
                </div>
              </div>
            )}
          </div>

          {/* Custom Time Slots */}
          {event.custom_time_slots && event.custom_time_slots.length > 0 && (
            <div className="mb-8">
              <h2 className="font-mono text-xs font-medium text-muted dark:text-[#7A7264] uppercase tracking-wide mb-3">
                Schedule
              </h2>
              <div className="space-y-2">
                {event.custom_time_slots.map((slot, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-charcoal/5 dark:border-gold/5 last:border-0"
                  >
                    <span className="text-charcoal dark:text-[#F0ECE3] font-medium">{slot.label}</span>
                    <span className="font-mono text-sm text-muted dark:text-[#7A7264]">{slot.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ticket Tiers */}
          {event.ticket_tiers && event.ticket_tiers.length > 0 && (
            <div className="mb-8">
              <h2 className="font-mono text-xs font-medium text-muted dark:text-[#7A7264] uppercase tracking-wide mb-3">
                Ticket Options
              </h2>
              <div className="space-y-3">
                {event.ticket_tiers.map((tier, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-4 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-charcoal dark:text-[#F0ECE3] font-semibold">{tier.name}</span>
                      {tier.description && (
                        <p className="text-xs text-muted dark:text-[#7A7264] mt-1">{tier.description}</p>
                      )}
                    </div>
                    <span className="font-mono text-charcoal dark:text-[#F0ECE3] font-semibold">
                      ${(tier.price_cents / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {(event.detailed_description || event.description) && (
            <div className="mb-8">
              <p className="text-charcoal dark:text-[#F0ECE3] whitespace-pre-line leading-relaxed">
                {event.detailed_description || event.description}
              </p>
            </div>
          )}

          {/* Live Taping info */}
          {event.event_category === "live-taping" && (event.where_to_watch_later || event.audience_etiquette) && (
            <div className="mb-8 space-y-4">
              {event.where_to_watch_later && (
                <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-4">
                  <h3 className="font-mono text-xs font-medium text-gold uppercase tracking-wide mb-2">Where to Watch</h3>
                  <p className="text-sm text-charcoal dark:text-[#F0ECE3] whitespace-pre-line">{event.where_to_watch_later}</p>
                </div>
              )}
              {event.audience_etiquette && (
                <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-4">
                  <h3 className="font-mono text-xs font-medium text-gold uppercase tracking-wide mb-2">Audience Etiquette</h3>
                  <p className="text-sm text-charcoal dark:text-[#F0ECE3] whitespace-pre-line">{event.audience_etiquette}</p>
                </div>
              )}
            </div>
          )}

          {/* Lineup */}
          {event.lineup && event.lineup.length > 0 && (
            <div className="mb-8">
              <h2 className="font-mono text-xs font-medium text-muted dark:text-[#7A7264] uppercase tracking-wide mb-3">
                Lineup
              </h2>
              <div className="space-y-2">
                {event.lineup.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-charcoal/5 dark:border-gold/5 last:border-0"
                  >
                    <span className="text-charcoal dark:text-[#F0ECE3] font-medium">{item.name}</span>
                    {item.role && (
                      <span className="font-mono text-xs text-muted dark:text-[#7A7264] uppercase">{item.role}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RSVP Form (for RSVP events) */}
          {event.is_rsvp && !event.is_sold_out && (
            <div className="mb-8">
              <RSVPForm eventId={event.id} eventTitle={event.title} />
            </div>
          )}

          {/* Actions: Buy Tickets + Add to Calendar + Share */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pt-4 border-t border-charcoal/10 dark:border-gold/10">
            {!event.is_sold_out && !event.is_rsvp && (
              <Link
                href={
                  event.ticket_price_cents && event.ticket_capacity
                    ? `/tickets/${event.id}`
                    : `/tickets?event=${event.id}`
                }
                className="inline-block px-6 py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 transition-colors btn-shimmer dark:bg-gold dark:text-[#0D0C0A] dark:hover:bg-[#D4A84B]"
              >
                {event.ticket_price_cents && event.ticket_capacity
                  ? `Buy Tickets — ${priceDisplay}`
                  : "Request Tickets"}
              </Link>
            )}
            <AddToCalendar
              title={event.title}
              date={event.date}
              durationMinutes={event.event_duration_minutes}
              location={address}
              description={event.calendar_description || event.description || undefined}
              eventUrl={eventUrl}
              doorsTime={event.doors_time || undefined}
              timezone={event.timezone || "America/Chicago"}
            />
          </div>

          {/* Share Bar */}
          <div className="pt-4 border-t border-charcoal/10 dark:border-gold/10">
            <ShareBar
              url={eventUrl}
              title={event.title}
              description={
                event.performer
                  ? `${event.performer} — ${dateStr} at Mad Hatter Comedy Club`
                  : `${dateStr} at Mad Hatter Comedy Club`
              }
              imageUrl={event.image_url || undefined}
            />
          </div>
        </div>
      </div>
    </>
  );
}
