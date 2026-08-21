import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { MerchItem } from "@/lib/supabase";
import Reveal from "@/components/Reveal";
import { getVenueInfo } from "@/lib/venue";

export const revalidate = 60;

export const metadata = {
  title: "Merch | Mad Hatter Comedy Club",
  description: "Official Mad Hatter Comedy Club merchandise. Hats, tees, and more.",
};

async function getMerch(): Promise<MerchItem[]> {
  const { data } = await supabase
    .from("merch_items")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as MerchItem[]) ?? [];
}

export default async function MerchPage() {
  const [products, venue] = await Promise.all([getMerch(), getVenueInfo()]);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-off-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              Rep the Club
            </p>
            <h1 className="font-display text-5xl sm:text-6xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block">Official</span>
              <span className="font-display font-semibold text-charcoal block">Merch</span>
            </h1>
            <p className="mt-4 text-muted max-w-xl mx-auto">
              Official Mad Hatter gear. Available at the venue and online soon.
            </p>
            <div className="flex items-center gap-4 mt-4 justify-center">
              <div className="w-12 h-px bg-charcoal/10" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">Gear Up</span>
              <div className="w-12 h-px bg-charcoal/10" />
            </div>
          </div>
        </Reveal>

        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={i * 80}>
                <div className="bg-white border border-charcoal/10 overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-charcoal/5 transition-all duration-300">
                  <div className="aspect-square bg-off-white-2 flex items-center justify-center relative overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="font-display text-2xl text-muted/30">MH</span>
                        <p className="text-xs text-muted mt-2">Photo coming soon</p>
                      </div>
                    )}
                    {product.tag && (
                      <span className="absolute top-3 right-3 font-mono text-xs px-2 py-0.5 bg-gold text-white font-medium">
                        {product.tag}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-charcoal">{product.name}</h3>
                      <span className="text-gold font-mono font-medium text-sm">
                        ${(product.price_cents / 100).toFixed(2)}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-xs text-muted leading-relaxed">{product.description}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="text-center py-16 mb-12">
              <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
                Coming Soon
              </p>
              <p className="text-muted text-lg">Merch catalog coming soon.</p>
              <p className="text-muted text-sm mt-2">Check back or visit us at a show.</p>
            </div>
          </Reveal>
        )}

        {/* Online store banner */}
        <Reveal>
          <div className="bg-charcoal grain p-8 sm:p-10 text-center mb-10">
            <div className="relative z-[2]">
              <h2 className="font-display text-2xl font-semibold text-off-white mb-2">
                Online Store Coming Soon
              </h2>
              <p className="text-muted-dark text-sm max-w-md mx-auto mb-6">
                We&apos;re setting up online ordering. In the meantime, all merch is available at the venue during shows.
              </p>
              <Link
                href="/contact"
                className="inline-block px-8 py-3 bg-gold text-white font-semibold hover:bg-gold-soft hover:text-charcoal transition-colors"
              >
                Ask About Merch
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Info */}
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-off-white-2 border border-charcoal/10 p-5">
              <div className="font-mono text-xs tracking-widest uppercase text-gold mb-2">At the Venue</div>
              <p className="text-muted">
                All merchandise is available at our merch table during show nights. Cash and card accepted.
              </p>
            </div>
            <div className="bg-off-white-2 border border-charcoal/10 p-5">
              <div className="font-mono text-xs tracking-widest uppercase text-gold mb-2">Custom Orders</div>
              <p className="text-muted">
                Need bulk orders for an event or want something custom? Email us at{" "}
                <a href={`mailto:${venue.merchEmail}`} className="text-gold hover:underline">
                  {venue.merchEmail}
                </a>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
