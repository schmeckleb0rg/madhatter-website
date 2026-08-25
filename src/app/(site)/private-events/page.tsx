import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Room } from "@/lib/supabase";
import Reveal from "@/components/Reveal";
import PrivateEventForm from "@/components/PrivateEventForm";

export const revalidate = 60;

export const metadata = {
  title: "Private Events | Mad Hatter Comedy Club",
  description: "Host your next event at Mad Hatter Comedy Club. Corporate events, birthdays, weddings, and private shows.",
};

async function getRooms(): Promise<Room[]> {
  const { data } = await supabase
    .from("rooms")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

const amenities = [
  "Full-service bar",
  "Professional sound system",
  "Stage lighting",
  "Dedicated event coordinator",
  "Custom catering options",
  "A/V equipment",
  "Green room access",
  "Valet parking available",
];

export default async function PrivateEventsPage() {
  const rooms = await getRooms();

  return (
    <div className="pt-24 pb-20 min-h-screen bg-off-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              Host Your Event
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block">Private</span>
              <span className="font-display font-semibold text-charcoal block">Events</span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              From corporate gatherings to birthday celebrations, Mad Hatter Comedy Club is the perfect
              venue for your next private event. Our spaces offer a unique, unforgettable experience
              with world-class entertainment.
            </p>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">Book Now</span>
              <div className="w-12 h-px bg-charcoal/10" />
            </div>
          </div>
        </Reveal>

        {/* Room Options */}
        {rooms.length > 0 && (
          <Reveal>
            <div className="mb-16">
              <h2 className="font-display text-2xl font-semibold text-charcoal mb-6 text-center tracking-tight">
                Available Spaces
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room, i) => (
                  <Reveal key={room.id} delay={i * 80}>
                    <div className="bg-white border border-charcoal/10 overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-charcoal/5 transition-all duration-300">
                      <div className="relative aspect-[4/3] bg-off-white-2 overflow-hidden">
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
                          <span className="absolute top-3 right-3 font-mono text-xs px-2 py-1 bg-charcoal/80 text-off-white font-medium">
                            Up to {room.capacity} guests
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-display font-semibold text-charcoal text-lg">{room.name}</h3>
                        {room.description && (
                          <p className="text-sm text-muted mt-1 line-clamp-2">{room.description}</p>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Amenities */}
        <Reveal>
          <div className="bg-charcoal grain p-8 sm:p-10 mb-16">
            <div className="relative z-[2]">
              <h2 className="font-display text-2xl font-semibold text-off-white mb-6 text-center tracking-tight">
                What We Offer
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-muted-dark">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Inquiry Form */}
        <Reveal>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-semibold text-charcoal tracking-tight">
                Request a Quote
              </h2>
              <p className="text-muted text-sm mt-2">
                Tell us about your event and we&apos;ll put together a custom package for you.
              </p>
            </div>
            <div className="bg-white border border-charcoal/10 p-6 sm:p-8">
              <PrivateEventForm />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
