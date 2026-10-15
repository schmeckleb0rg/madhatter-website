import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Room } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

async function getRoom(slug: string): Promise<Room | null> {
  const { data } = await supabase
    .from("rooms")
    .select("*")
    .eq("slug", slug)
    .single();
  return data as Room | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoom(slug);
  if (!room) return { title: "Space Not Found" };
  return {
    title: `${room.name} | Event Spaces | Mad Hatter Comedy Club`,
    description: room.description || `${room.name} at Mad Hatter Comedy Club`,
  };
}

export default async function RoomDetailPage({ params }: Props) {
  const { slug } = await params;
  const room = await getRoom(slug);
  if (!room) notFound();

  const tourImages = (room.virtual_tour_images || []) as string[];

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back link */}
        <Link
          href="/event-spaces"
          className="inline-flex items-center gap-1.5 text-sm text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Event Spaces
        </Link>

        {/* Main image */}
        {room.image_url && (
          <Reveal>
            <div className="relative aspect-video w-full bg-off-white-2 dark:bg-[#161412] overflow-hidden mb-8">
              <Image
                src={room.image_url}
                alt={room.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          </Reveal>
        )}

        {/* Title + capacity */}
        <Reveal>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal dark:text-[#F0ECE3]">
                {room.name}
              </h1>
              {room.capacity && (
                <span className="font-mono text-xs px-3 py-1 bg-gold/10 text-gold font-medium">
                  {room.capacity} guests
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5">
              {room.room_type || "general"}
            </span>
          </div>
        </Reveal>

        {/* Description */}
        {room.description && (
          <Reveal>
            <p className="text-charcoal dark:text-[#C4BDA8] leading-relaxed mb-8 whitespace-pre-line">
              {room.description}
            </p>
          </Reveal>
        )}

        {/* Info grid */}
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Features */}
            {room.features && room.features.length > 0 && (
              <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5">
                <h3 className="font-mono text-xs tracking-widest uppercase text-gold mb-3">Features</h3>
                <ul className="space-y-2">
                  {room.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted dark:text-[#C4BDA8]">
                      <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rates */}
            {room.rates && (
              <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5">
                <h3 className="font-mono text-xs tracking-widest uppercase text-gold mb-3">Rates</h3>
                <p className="text-sm text-muted dark:text-[#C4BDA8] whitespace-pre-line">{room.rates}</p>
              </div>
            )}

            {/* Equipment */}
            {room.equipment_specs && (
              <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5">
                <h3 className="font-mono text-xs tracking-widest uppercase text-gold mb-3">Equipment</h3>
                <p className="text-sm text-muted dark:text-[#C4BDA8] whitespace-pre-line">{room.equipment_specs}</p>
              </div>
            )}
          </div>
        </Reveal>

        {/* Virtual Tour Gallery */}
        {tourImages.length > 0 && (
          <Reveal>
            <div className="mb-8">
              <h2 className="font-mono text-xs tracking-widest uppercase text-gold mb-4">Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {tourImages.map((img, i) => (
                  <div key={i} className="relative aspect-[4/3] bg-off-white-2 dark:bg-[#161412] overflow-hidden">
                    <Image
                      src={img}
                      alt={`${room.name} photo ${i + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* CTA */}
        <Reveal>
          <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 sm:p-8 text-center">
            <h3 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-2">
              Interested in this space?
            </h3>
            <p className="text-sm text-muted dark:text-[#7A7264] mb-4">
              Get in touch to discuss availability and pricing.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 transition-colors dark:bg-gold dark:text-[#0D0C0A] btn-shimmer"
            >
              Inquire Now
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
