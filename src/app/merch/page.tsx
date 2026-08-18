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
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-club-red text-xs font-bold tracking-widest uppercase mb-3">
            Rep the Club
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Merch
          </h1>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Official Mad Hatter gear. Available at the venue and online soon.
          </p>
          <div className="mt-4 text-club-gold tracking-widest opacity-30">&#9824; &#9829; &#9827; &#9830;</div>
        </div>

        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-club-card border border-club-border rounded-lg overflow-hidden group"
              >
                <div className="aspect-square bg-club-bg flex items-center justify-center relative overflow-hidden">
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
                      <div className="text-5xl opacity-20 mb-2">🎩</div>
                      <p className="text-xs text-gray-600">Photo coming soon</p>
                    </div>
                  )}
                  {product.tag && (
                    <span className="absolute top-3 right-3 text-xs px-2 py-0.5 bg-club-red text-white rounded font-semibold">
                      {product.tag}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white">{product.name}</h3>
                    <span className="text-club-gold font-bold text-sm">
                      ${(product.price_cents / 100).toFixed(2)}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">{product.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 mb-12">
            <div className="text-6xl mb-6 opacity-20">🎩</div>
            <p className="text-gray-500 text-lg">Merch catalog coming soon.</p>
            <p className="text-gray-600 text-sm mt-2">Check back or visit us at a show.</p>
          </div>
        )}

        {/* Online store banner */}
        <div className="bg-club-card border border-club-border rounded-lg p-8 sm:p-10 text-center mb-10">
          <div className="text-5xl mb-4 opacity-30">🛒</div>
          <h2
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Online Store Coming Soon
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            We&apos;re setting up online ordering. In the meantime, all merch is available at the venue during shows.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-club-red text-white font-bold rounded hover:bg-red-700 transition-colors"
          >
            Ask About Merch
          </Link>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-club-card border border-club-border rounded p-5">
            <div className="text-club-gold font-semibold mb-2">At the Venue</div>
            <p className="text-gray-400">
              All merchandise is available at our merch table during show nights. Cash and card accepted.
            </p>
          </div>
          <div className="bg-club-card border border-club-border rounded p-5">
            <div className="text-club-gold font-semibold mb-2">Custom Orders</div>
            <p className="text-gray-400">
              Need bulk orders for an event or want something custom? Email us at{" "}
              <a href="mailto:merch@madhattercomedy.com" className="text-club-red hover:underline">
                merch@madhattercomedy.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
