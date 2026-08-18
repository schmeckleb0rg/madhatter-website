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
    <div className="pt-24 pb-20 min-h-screen bg-off-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
            The Lineup
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-charcoal">
            Our Comedians
          </h1>
          <div className="w-16 h-0.5 bg-gold mt-4 mx-auto" />
        </div>

        {comedians.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              The Lineup
            </p>
            <p className="text-muted text-lg">No comedians listed yet.</p>
            <p className="text-muted text-sm mt-2">Check back soon — the lineup is always growing.</p>
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
