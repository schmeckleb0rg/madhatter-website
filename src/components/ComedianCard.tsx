import Image from "next/image";
import Link from "next/link";
import type { Comedian } from "@/lib/supabase";

type Props = {
  comedian: Comedian;
  hasUpcomingShow?: boolean;
};

export default function ComedianCard({ comedian, hasUpcomingShow }: Props) {
  return (
    <div className="group bg-white grain border-2 border-charcoal/15 dark:bg-[#1C1A16] dark:border-gold/10 shadow-[2px_3px_0_rgba(27,26,23,0.06),0_1px_3px_rgba(27,26,23,0.04)] dark:shadow-[2px_3px_0_rgba(184,147,74,0.04),0_1px_3px_rgba(0,0,0,0.3)] overflow-hidden hover:border-gold/40 hover:-translate-y-1 hover:shadow-[4px_6px_0_rgba(27,26,23,0.08),0_4px_12px_rgba(27,26,23,0.06)] dark:hover:border-gold/30 dark:hover:shadow-[0_0_15px_rgba(184,147,74,0.08)] transition-all duration-300">
      {/* Headshot */}
      <div className="relative h-40 sm:h-48 bg-off-white-2 dark:bg-[#161412] overflow-hidden">
        {comedian.headshot_url ? (
          <Image
            src={comedian.headshot_url}
            alt={comedian.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-off-white-2 dark:bg-[#161412]">
            <span className="font-display text-2xl text-muted/30 dark:text-[#7A7264]/30">MH</span>
          </div>
        )}
        {comedian.featured && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-gold text-white text-xs font-mono font-medium tracking-wider uppercase">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-display font-semibold text-charcoal dark:text-[#F0ECE3] text-base sm:text-lg">{comedian.name}</h3>
        {comedian.bio && (
          <p className="text-sm text-muted dark:text-[#7A7264] mt-1 line-clamp-2">{comedian.bio}</p>
        )}

        {/* Social links */}
        {comedian.social_links && (
          <div className="flex items-center gap-3 mt-3">
            {comedian.social_links.instagram && (
              <a
                href={comedian.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted dark:text-[#7A7264] hover:text-gold dark:hover:text-gold transition-colors"
              >
                Instagram
              </a>
            )}
            {comedian.social_links.website && (
              <a
                href={comedian.social_links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted dark:text-[#7A7264] hover:text-gold dark:hover:text-gold transition-colors"
              >
                Website
              </a>
            )}
          </div>
        )}

        {/* Upcoming Shows button */}
        {hasUpcomingShow && (
          <Link
            href="/events"
            className="block mt-3 text-center py-2.5 border border-gold text-gold text-xs font-semibold hover:bg-gold hover:text-white transition-colors active:scale-[0.98] dark:border-gold dark:text-gold dark:hover:bg-gold dark:hover:text-[#0D0C0A]"
          >
            Upcoming Shows
          </Link>
        )}
      </div>
    </div>
  );
}
