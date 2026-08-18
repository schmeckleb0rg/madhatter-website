export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import Link from "next/link";
import type { Comedian } from "@/lib/supabase";

async function getComedians(): Promise<Comedian[]> {
  const db = getAdminClient();
  const { data } = await db.from("comedians").select("*").order("name", { ascending: true });
  return data ?? [];
}

export default async function AdminComediansPage() {
  const comedians = await getComedians();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-charcoal font-display">
          Comedians
        </h1>
        <Link
          href="/admin/comedians/new"
          className="px-4 py-2 bg-charcoal text-off-white text-sm font-semibold hover:bg-charcoal-2 transition-colors"
        >
          + Add Comedian
        </Link>
      </div>

      {comedians.length === 0 ? (
        <div className="text-center py-20 text-muted">No comedians yet.</div>
      ) : (
        <div className="space-y-2">
          {comedians.map((comedian) => (
            <Link
              key={comedian.id}
              href={`/admin/comedians/${comedian.id}`}
              className="flex items-center justify-between bg-white border border-charcoal/10 px-5 py-4 hover:border-gold/30 transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-charcoal truncate">{comedian.name}</div>
                  {comedian.bio && (
                    <div className="text-xs text-muted truncate max-w-md">{comedian.bio}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {comedian.featured && (
                  <span className="text-xs px-2 py-0.5 bg-gold/10 text-gold">Featured</span>
                )}
                <span className="text-muted text-sm group-hover:text-charcoal transition-colors">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
