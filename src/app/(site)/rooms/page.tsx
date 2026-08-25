import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Room } from "@/lib/supabase";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

export const metadata = {
  title: "Rooms | Mad Hatter Comedy Club",
  description: "Explore our spaces at Mad Hatter Comedy Club. From intimate stages to private event rooms.",
};

async function getRooms(): Promise<Room[]> {
  const { data } = await supabase
    .from("rooms")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="pt-24 pb-20 min-h-screen bg-off-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              Our Spaces
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block">The</span>
              <span className="font-display font-semibold text-charcoal block">Rooms</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">Explore</span>
              <div className="w-12 h-px bg-charcoal/10" />
            </div>
          </div>
        </Reveal>

        {rooms.length === 0 ? (
          <Reveal>
            <div className="text-center py-20">
              <svg className="w-12 h-12 text-gold/30 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
              </svg>
              <p className="text-muted text-lg">Room details coming soon.</p>
              <p className="text-muted text-sm mt-2">We&apos;re preparing our spaces for you.</p>
            </div>
          </Reveal>
        ) : (
          <div className="space-y-10">
            {rooms.map((room, i) => (
              <Reveal key={room.id} delay={i * 100}>
                <div className="bg-white border border-charcoal/10 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Image */}
                    <div className="relative aspect-[4/3] md:aspect-auto bg-off-white-2 overflow-hidden">
                      {room.image_url ? (
                        <Image
                          src={room.image_url}
                          alt={room.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="h-full min-h-[240px] flex flex-col items-center justify-center gap-2">
                          <svg className="w-12 h-12 text-gold/20" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
                          </svg>
                          <span className="font-display text-xl text-muted/20">MH</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-6 sm:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="font-display text-2xl font-semibold text-charcoal tracking-tight">
                          {room.name}
                        </h2>
                        {room.capacity && (
                          <span className="font-mono text-xs px-2 py-1 bg-gold/10 text-gold font-medium">
                            {room.capacity} guests
                          </span>
                        )}
                      </div>

                      {room.description && (
                        <p className="text-muted leading-relaxed mb-5">{room.description}</p>
                      )}

                      {room.features && room.features.length > 0 && (
                        <div>
                          <h3 className="font-mono text-xs tracking-widest uppercase text-gold mb-3">Features</h3>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {room.features.map((feature, fi) => (
                              <li key={fi} className="flex items-center gap-2 text-sm text-muted">
                                <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
