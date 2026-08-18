import Image from "next/image";
import type { Comedian } from "@/lib/supabase";

export default function ComedianCard({ comedian }: { comedian: Comedian }) {
  return (
    <div className="group bg-club-card border border-club-border rounded-lg overflow-hidden hover:border-club-gold/40 transition-all duration-300">
      {/* Headshot */}
      <div className="relative h-48 bg-club-bg overflow-hidden">
        {comedian.headshot_url ? (
          <Image
            src={comedian.headshot_url}
            alt={comedian.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-6xl opacity-20">🎩</span>
          </div>
        )}
        {comedian.featured && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-club-gold text-black text-xs font-bold rounded">
            FEATURED
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-white text-lg">{comedian.name}</h3>
        {comedian.bio && (
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{comedian.bio}</p>
        )}

        {/* Social links */}
        {comedian.social_links && (
          <div className="flex items-center gap-3 mt-3">
            {comedian.social_links.instagram && (
              <a
                href={comedian.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-club-gold transition-colors"
              >
                Instagram ↗
              </a>
            )}
            {comedian.social_links.website && (
              <a
                href={comedian.social_links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-club-gold transition-colors"
              >
                Website ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
