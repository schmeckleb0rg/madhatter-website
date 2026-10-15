import { supabase } from "@/lib/supabase";
import ClassesClient from "@/components/ClassesClient";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

export const metadata = {
  title: "Comedy Classes | Mad Hatter Comedy Club",
  description:
    "Learn stand-up, improv, and sketch comedy at Mad Hatter Comedy Club in Chicago. Beginner to advanced classes and workshops.",
};

type ClassItem = {
  id: string;
  title: string;
  type: string;
  level: string;
  duration: string | null;
  price_cents: number;
  schedule: string | null;
  description: string | null;
  image_url: string | null;
  instructor: string | null;
  enrollment_status: string;
  max_enrollment: number | null;
  current_enrollment: number;
  cohort_start_date: string | null;
  path_order: number;
};

async function getClasses(): Promise<ClassItem[]> {
  const { data } = await supabase
    .from("classes")
    .select("*")
    .eq("is_active", true)
    .order("path_order", { ascending: true });
  return (data as ClassItem[]) ?? [];
}

export default async function ClassesPage() {
  const classes = await getClasses();

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              Learn the Craft
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block dark:text-[#7A7264]">Comedy</span>
              <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">Classes</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">Enroll Now</span>
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
            </div>
          </div>
        </Reveal>

        <ClassesClient classes={classes} />

        {/* Why take a class */}
        <Reveal>
          <div className="bg-off-white-2 dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 p-6 sm:p-8 mt-12">
            <h3 className="font-display text-lg font-semibold text-charcoal dark:text-[#F0ECE3] mb-6">
              Why Learn at Mad Hatter?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="font-display text-gold text-lg font-semibold mb-1">Real Stage Time</div>
                <p className="text-muted dark:text-[#7A7264] text-xs">
                  Perform on the same stage as the pros. Every class ends with a live show.
                </p>
              </div>
              <div>
                <div className="font-display text-gold text-lg font-semibold mb-1">Industry Instructors</div>
                <p className="text-muted dark:text-[#7A7264] text-xs">
                  Learn from working comedians who&apos;ve toured nationally and appeared on TV.
                </p>
              </div>
              <div>
                <div className="font-display text-gold text-lg font-semibold mb-1">Community</div>
                <p className="text-muted dark:text-[#7A7264] text-xs">
                  Join a network of comics. Many of our students go on to perform regularly at the club.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
