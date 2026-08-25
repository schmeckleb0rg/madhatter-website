"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { MerchItem } from "@/lib/supabase";
import MerchFiltersBar, { type MerchFilters } from "@/components/MerchFilters";
import SizingChart from "@/components/SizingChart";

type Props = {
  products: MerchItem[];
  merchEmail: string;
  content: Record<string, string>;
};

export default function MerchClient({ products, merchEmail, content }: Props) {
  const [filters, setFilters] = useState<MerchFilters>({
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    category: "all",
    showLimited: true,
    showArchive: true,
  });

  const allColors = useMemo(() => {
    const colorSet = new Set<string>();
    products.forEach((p) => (p.colors || []).forEach((c: string) => colorSet.add(c)));
    return Array.from(colorSet);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filters.category !== "all" && p.category !== filters.category) return false;
      if (!filters.showLimited && p.is_limited) return false;
      if (!filters.showArchive && p.is_archive) return false;
      if (filters.sizes.length > 0 && p.sizes && p.sizes.length > 0) {
        const hasMatchingSize = p.sizes.some((s: string) => filters.sizes.includes(s));
        if (!hasMatchingSize) return false;
      }
      return true;
    });
  }, [products, filters]);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-off-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
            {content.subtitle || "Rep the Club"}
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-light leading-none tracking-tight">
            <span className="font-display italic text-muted block">
              {content.title_line1 || "Official"}
            </span>
            <span className="font-display font-semibold text-charcoal block">
              {content.title_line2 || "Merch"}
            </span>
          </h1>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            {content.description || "Official Mad Hatter gear. Available at the venue and online soon."}
          </p>
          <div className="flex items-center gap-4 mt-4 justify-center">
            <div className="w-12 h-px bg-charcoal/10" />
            <span className="font-mono text-xs tracking-widest uppercase text-gold">
              {content.badge || "Gear Up"}
            </span>
            <div className="w-12 h-px bg-charcoal/10" />
          </div>
        </div>

        {/* Sizing Chart */}
        <SizingChart />

        {/* Filters */}
        {products.length > 0 && (
          <MerchFiltersBar
            availableColors={allColors}
            filters={filters}
            onChange={setFilters}
          />
        )}

        {/* Products grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-charcoal/10 overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-charcoal/5 transition-all duration-300"
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
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    {product.tag && (
                      <span className="font-mono text-xs px-2 py-0.5 bg-gold text-white font-medium">
                        {product.tag}
                      </span>
                    )}
                    {product.is_limited && (
                      <span className="font-mono text-xs px-2 py-0.5 bg-charcoal text-off-white font-medium">
                        Limited Time
                      </span>
                    )}
                    {product.inventory_count !== null && product.inventory_count <= 5 && product.inventory_count > 0 && (
                      <span className="font-mono text-xs px-2 py-0.5 font-medium" style={{ color: "#9C4A38", backgroundColor: "rgba(156,74,56,0.10)" }}>
                        Only {product.inventory_count} left
                      </span>
                    )}
                    {product.is_archive && (
                      <span className="font-mono text-xs px-2 py-0.5 bg-muted/20 text-muted font-medium">
                        Archive
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-charcoal">{product.name}</h3>
                    <span className="text-gold font-mono font-medium text-sm">
                      ${(product.price_cents / 100).toFixed(2)}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-xs text-muted leading-relaxed mb-2">{product.description}</p>
                  )}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {product.sizes.map((s: string) => (
                        <span key={s} className="text-xs px-1.5 py-0.5 border border-charcoal/10 text-muted">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-muted capitalize">{product.category}</span>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="text-center py-16 mb-12">
            <p className="text-muted text-lg">No items match your filters.</p>
            <button
              onClick={() => setFilters({ sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], category: "all", showLimited: true, showArchive: true })}
              className="text-gold text-sm mt-2 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="text-center py-16 mb-12">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">Coming Soon</p>
            <p className="text-muted text-lg">Merch catalog coming soon.</p>
            <p className="text-muted text-sm mt-2">Check back or visit us at a show.</p>
          </div>
        )}

        {/* Online store banner */}
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
              <a href={`mailto:${merchEmail}`} className="text-gold hover:underline">
                {merchEmail}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
