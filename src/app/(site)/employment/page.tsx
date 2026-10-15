import { supabase } from "@/lib/supabase";
import Reveal from "@/components/Reveal";
import JobApplicationForm from "@/components/JobApplicationForm";

export const revalidate = 300;

export const metadata = {
  title: "Employment | Mad Hatter Comedy Club",
  description:
    "Join the Mad Hatter Comedy Club team. Browse open positions and apply today.",
};

type JobListing = {
  id: string;
  title: string;
  department: string | null;
  type: string;
  description: string | null;
  requirements: string | null;
  compensation: string | null;
  is_active: boolean;
};

async function getActiveListings(): Promise<JobListing[]> {
  const { data } = await supabase
    .from("job_listings")
    .select("*")
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .order("sort_order", { ascending: true });
  return (data as JobListing[]) ?? [];
}

export default async function EmploymentPage() {
  const listings = await getActiveListings();

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen dark:bg-[#0D0C0A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              Careers
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block dark:text-[#7A7264]">Work</span>
              <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">With Us</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">Join The Team</span>
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
            </div>
          </div>
        </Reveal>

        {/* What It's Like */}
        <Reveal>
          <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 sm:p-8 mb-10">
            <h2 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-4">
              What It&apos;s Like to Work Here
            </h2>
            <p className="text-muted dark:text-[#C4BDA8] leading-relaxed mb-4">
              Mad Hatter Comedy Club is more than a venue — it&apos;s a community of people who love making audiences
              laugh. Whether you&apos;re behind the bar, on the stage, or running the show behind the scenes, you&apos;ll
              be part of something electric every single night.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-off-white dark:bg-[#161412] border border-charcoal/5 dark:border-gold/5">
                <div className="font-mono text-xs text-gold uppercase tracking-wider mb-2">Perks</div>
                <p className="text-sm text-charcoal dark:text-[#F0ECE3]">Free show tickets & staff events</p>
              </div>
              <div className="text-center p-4 bg-off-white dark:bg-[#161412] border border-charcoal/5 dark:border-gold/5">
                <div className="font-mono text-xs text-gold uppercase tracking-wider mb-2">Culture</div>
                <p className="text-sm text-charcoal dark:text-[#F0ECE3]">Creative, fun, team-oriented</p>
              </div>
              <div className="text-center p-4 bg-off-white dark:bg-[#161412] border border-charcoal/5 dark:border-gold/5">
                <div className="font-mono text-xs text-gold uppercase tracking-wider mb-2">Growth</div>
                <p className="text-sm text-charcoal dark:text-[#F0ECE3]">Room to grow & take on new roles</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Open Positions */}
        {listings.length > 0 && (
          <Reveal>
            <div className="mb-10">
              <h2 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-4">
                Open Positions
              </h2>
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <h3 className="font-display text-lg font-semibold text-charcoal dark:text-[#F0ECE3]">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {listing.department && (
                          <span className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-[#7A7264] bg-off-white dark:bg-[#161412] px-2 py-0.5">
                            {listing.department}
                          </span>
                        )}
                        <span className="font-mono text-[10px] uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5">
                          {listing.type}
                        </span>
                      </div>
                    </div>
                    {listing.description && (
                      <p className="text-sm text-muted dark:text-[#C4BDA8] whitespace-pre-line mb-3">
                        {listing.description}
                      </p>
                    )}
                    {listing.requirements && (
                      <div className="mb-3">
                        <div className="font-mono text-xs text-gold uppercase tracking-wider mb-1">Requirements</div>
                        <p className="text-sm text-muted dark:text-[#C4BDA8] whitespace-pre-line">
                          {listing.requirements}
                        </p>
                      </div>
                    )}
                    {listing.compensation && (
                      <div className="font-mono text-xs text-charcoal dark:text-[#F0ECE3]">
                        Compensation: {listing.compensation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Application Form */}
        <Reveal>
          <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-2">
              {listings.length > 0 ? "Apply Now" : "General Interest"}
            </h2>
            <p className="text-sm text-muted dark:text-[#7A7264] mb-6">
              {listings.length > 0
                ? "Interested in one of the positions above? Fill out the form below."
                : "No open positions right now, but we're always looking for great people. Drop us a line."}
            </p>
            <JobApplicationForm
              listings={listings.map((l) => ({ id: l.id, title: l.title }))}
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
