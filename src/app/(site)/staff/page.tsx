import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { StaffMember } from "@/lib/supabase";
import Reveal from "@/components/Reveal";

export const revalidate = 300;

export const metadata = {
  title: "Our Staff | Mad Hatter Comedy Club",
  description: "Meet the team behind Mad Hatter Comedy Club in Chicago.",
};

async function getStaffMembers(): Promise<StaffMember[]> {
  const { data } = await supabase
    .from("staff_members")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as StaffMember[]) ?? [];
}

export default async function StaffPage() {
  const staff = await getStaffMembers();

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">The Team</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block dark:text-[#7A7264]">Meet Our</span>
              <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">Staff</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">Behind the Scenes</span>
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
            </div>
          </div>
        </Reveal>

        {staff.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((member, i) => (
              <Reveal key={member.id} delay={100 + i * 80} direction="card">
                <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 overflow-hidden group">
                  {/* Photo */}
                  <div className="aspect-[3/4] relative overflow-hidden bg-off-white dark:bg-[#161412]">
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl text-charcoal/20 dark:text-off-white/10 font-display">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-charcoal dark:text-[#F0ECE3] font-display">
                      {member.name}
                    </h3>
                    <p className="text-xs font-mono uppercase tracking-widest text-gold mt-1">
                      {member.role}
                    </p>
                    {member.location && (
                      <p className="text-xs text-muted dark:text-[#7A7264] mt-2">
                        From: {member.location}
                      </p>
                    )}
                    {member.bio && (
                      <p className="text-sm text-muted dark:text-[#C4BDA8] mt-3 leading-relaxed line-clamp-4">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal delay={100}>
            <div className="text-center py-20 bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10">
              <p className="text-muted dark:text-[#7A7264]">Staff profiles coming soon.</p>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
