import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Room, GalleryImage } from "@/lib/supabase";
import Reveal from "@/components/Reveal";
import MasonryGallery from "@/components/MasonryGallery";

export const revalidate = 60;

export const metadata = {
  title: "Event Spaces | Mad Hatter Comedy Club",
  description:
    "Host your next event at Mad Hatter Comedy Club. Private events, corporate gatherings, podcast recording, and more.",
};

async function getRooms(): Promise<Room[]> {
  const { data } = await supabase
    .from("rooms")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as Room[]) ?? [];
}

async function getGalleryImages(): Promise<GalleryImage[]> {
  const { data } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true })
    .limit(12);
  return (data as GalleryImage[]) ?? [];
}

export default async function EventSpacesPage() {
  const [rooms, galleryImages] = await Promise.all([getRooms(), getGalleryImages()]);

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              Host Your Event
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block dark:text-[#7A7264]">Event</span>
              <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">Spaces</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">Book A Space</span>
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
            </div>
          </div>
        </Reveal>

        {/* Quick links */}
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <Link
              href="/event-spaces/corporate"
              className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 text-center hover:border-gold/40 transition-colors group"
            >
              <div className="font-display text-lg font-semibold text-charcoal dark:text-[#F0ECE3] group-hover:text-gold transition-colors">
                Corporate Events
              </div>
              <p className="text-xs text-muted dark:text-[#7A7264] mt-1">Team-building, meetings & more</p>
            </Link>
            <Link
              href="/event-spaces/podcast"
              className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 text-center hover:border-gold/40 transition-colors group"
            >
              <div className="font-display text-lg font-semibold text-charcoal dark:text-[#F0ECE3] group-hover:text-gold transition-colors">
                Podcast Studio
              </div>
              <p className="text-xs text-muted dark:text-[#7A7264] mt-1">Record at the club</p>
            </Link>
            <Link
              href="/private-events"
              className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 text-center hover:border-gold/40 transition-colors group"
            >
              <div className="font-display text-lg font-semibold text-charcoal dark:text-[#F0ECE3] group-hover:text-gold transition-colors">
                Private Events
              </div>
              <p className="text-xs text-muted dark:text-[#7A7264] mt-1">Birthdays, parties & celebrations</p>
            </Link>
          </div>
        </Reveal>

        {/* Capacity comparison */}
        {rooms.length > 0 && (
          <Reveal>
            <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 sm:p-6 mb-12">
              <h2 className="font-mono text-xs tracking-widest uppercase text-gold mb-4">
                Space Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-charcoal/10 dark:border-gold/10">
                      <th className="text-left font-mono text-xs text-muted dark:text-[#7A7264] uppercase tracking-wider py-2 pr-4">Space</th>
                      <th className="text-left font-mono text-xs text-muted dark:text-[#7A7264] uppercase tracking-wider py-2 pr-4">Capacity</th>
                      <th className="text-left font-mono text-xs text-muted dark:text-[#7A7264] uppercase tracking-wider py-2 pr-4">Type</th>
                      <th className="text-left font-mono text-xs text-muted dark:text-[#7A7264] uppercase tracking-wider py-2">Features</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id} className="border-b border-charcoal/5 dark:border-gold/5 last:border-0">
                        <td className="py-3 pr-4">
                          <Link
                            href={`/event-spaces/${room.slug}`}
                            className="font-medium text-charcoal dark:text-[#F0ECE3] hover:text-gold transition-colors"
                          >
                            {room.name}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-muted dark:text-[#C4BDA8]">
                          {room.capacity ? `${room.capacity} guests` : "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5">
                            {room.room_type || "general"}
                          </span>
                        </td>
                        <td className="py-3 text-muted dark:text-[#C4BDA8] text-xs">
                          {room.features?.slice(0, 3).join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        )}

        {/* Room cards */}
        {rooms.length === 0 ? (
          <Reveal>
            <div className="text-center py-20">
              <p className="text-muted dark:text-[#7A7264] text-lg">Space details coming soon.</p>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {rooms.map((room, i) => (
              <Reveal key={room.id} delay={i * 80}>
                <Link
                  href={`/event-spaces/${room.slug}`}
                  className="block bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 overflow-hidden group hover:border-gold/30 transition-colors"
                >
                  <div className="relative aspect-[4/3] bg-off-white-2 dark:bg-[#161412] overflow-hidden">
                    {room.image_url ? (
                      <Image
                        src={room.image_url}
                        alt={room.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <span className="font-display text-2xl text-muted/20">MH</span>
                      </div>
                    )}
                    {room.capacity && (
                      <div className="absolute bottom-2 right-2 bg-charcoal/80 backdrop-blur px-2 py-1 text-xs text-off-white font-mono">
                        {room.capacity} guests
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-semibold text-charcoal dark:text-[#F0ECE3]">
                      {room.name}
                    </h3>
                    {room.description && (
                      <p className="text-sm text-muted dark:text-[#7A7264] mt-1 line-clamp-2">
                        {room.description}
                      </p>
                    )}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        {/* Venue Gallery */}
        {galleryImages.length > 0 && (
          <Reveal>
            <div className="mt-12 mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3]">
                  Venue Gallery
                </h2>
                <Link
                  href="/gallery"
                  className="text-xs text-gold hover:underline"
                >
                  View Full Gallery &rarr;
                </Link>
              </div>
              <MasonryGallery images={galleryImages} />
            </div>
          </Reveal>
        )}

        {/* CTA */}
        <Reveal>
          <div className="text-center mt-12">
            <p className="text-muted dark:text-[#7A7264] text-sm mb-4">Ready to book?</p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 transition-colors dark:bg-gold dark:text-[#0D0C0A] btn-shimmer"
            >
              Contact Us
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
