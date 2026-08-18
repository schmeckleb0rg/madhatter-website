export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { MerchItem } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

async function getMerch(): Promise<MerchItem[]> {
  const db = getAdminClient();
  const { data } = await db.from("merch_items").select("*").order("sort_order", { ascending: true });
  return (data as MerchItem[]) ?? [];
}

export default async function AdminMerchPage() {
  const items = await getMerch();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
            Merch
          </h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/merch/new"
          className="px-4 py-2 bg-club-red text-white text-sm font-semibold rounded hover:bg-red-700 transition-colors"
        >
          + Add Item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-600">No merch items yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/merch/${item.id}`}
              className="flex items-center justify-between bg-club-card border border-club-border rounded-lg px-5 py-4 hover:border-club-gold/30 transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-0">
                {item.image_url ? (
                  <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 relative">
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="48px" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded bg-club-bg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl opacity-20">🎩</span>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    ${(item.price_cents / 100).toFixed(2)}
                    {item.tag && <span className="ml-2 text-club-gold">{item.tag}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {!item.is_active && (
                  <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-500 rounded">Hidden</span>
                )}
                <span className="text-gray-600 text-sm group-hover:text-white transition-colors">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
