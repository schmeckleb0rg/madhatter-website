import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { MerchItem } from "@/lib/supabase";

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
  const products = await getMerch();

  return (
    <div className="pt-24 pb-20 min-h-screen bg-off-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
            Rep the Club
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-charcoal">
            Merch
          </h1>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            Official Mad Hatter gear. Available at the venue and online soon.
          </p>
          <div className="w-16 h-0.5 bg-gold mt-4 mx-auto" />
        </div>

        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-charcoal/10 overflow-hidden group"
              >
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
            ))}
          </div>
        ) : (
          <div className="text-center py-16 mb-12">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              Coming Soon
            </p>
            <p className="text-muted text-lg">Merch catalog coming soon.</p>
            <p className="text-muted text-sm mt-2">Check back or visit us at a show.</p>
          </div>
        )}

        {/* Online store banner */}
        <div className="bg-charcoal p-8 sm:p-10 text-center mb-10">
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

        {/* Info */}
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
              <a href="mailto:merch@madhattercomedy.com" className="text-gold hover:underline">
                merch@madhattercomedy.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
