import { supabase } from "@/lib/supabase";
import type { Comedian } from "@/lib/supabase";
import ComedianCard from "@/components/ComedianCard";

export const revalidate = 60;

export const metadata = {
  title: "Comedians | Mad Hatter Comedy Club",
  description: "Meet the comedians who perform at Mad Hatter Comedy Club in Chicago.",
};

async function getComedians(): Promise<Comedian[]> {
  const { data } = await supabase
    .from("comedians")
    .select("*")
    .order("name", { ascending: true });
  return data ?? [];
}

export default async function ComediansPage() {
  const comedians = await getComedians();

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-club-red text-xs font-bold tracking-widest uppercase mb-3">
            The Lineup
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Our Comedians
          </h1>
          <div className="mt-4 text-club-gold tracking-widest opacity-30">♠ ♥ ♣ ♦</div>
        </div>

        {comedians.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6 opacity-20">🎩</div>
            <p className="text-gray-500 text-lg">No comedians listed yet.</p>
            <p className="text-gray-600 text-sm mt-2">Check back soon — the lineup is always growing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {comedians.map((comedian) => (
              <ComedianCard key={comedian.id} comedian={comedian} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
