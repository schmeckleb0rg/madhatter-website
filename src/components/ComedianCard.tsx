import Image from "next/image";
import type { Comedian } from "@/lib/supabase";

export default function ComedianCard({ comedian }: { comedian: Comedian }) {
  return (
    <div className="group bg-white border border-charcoal/10 overflow-hidden hover:border-charcoal/20 transition-all duration-300">
      {/* Headshot */}
      <div className="relative h-48 bg-off-white-2 overflow-hidden">
        {comedian.headshot_url ? (
          <Image
            src={comedian.headshot_url}
            alt={comedian.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-off-white-2">
            <span className="font-display text-2xl text-muted/30">MH</span>
          </div>
        )}
        {comedian.featured && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-gold text-white text-xs font-mono font-medium tracking-wider uppercase">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-semibold text-charcoal text-lg">{comedian.name}</h3>
        {comedian.bio && (
          <p className="text-sm text-muted mt-1 line-clamp-2">{comedian.bio}</p>
        )}

        {/* Social links */}
        {comedian.social_links && (
          <div className="flex items-center gap-3 mt-3">
            {comedian.social_links.instagram && (
              <a
                href={comedian.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted hover:text-gold transition-colors"
              >
                Instagram
              </a>
            )}
            {comedian.social_links.website && (
              <a
                href={comedian.social_links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted hover:text-gold transition-colors"
              >
                Website
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
