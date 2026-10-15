import Image from "next/image";

type Partner = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
  distance: string | null;
  walk_time: string | null;
};

export default function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 overflow-hidden group">
      {partner.image_url && (
        <div className="relative aspect-[3/2] bg-off-white-2 dark:bg-[#161412]">
          <Image
            src={partner.image_url}
            alt={partner.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display text-base font-semibold text-charcoal dark:text-[#F0ECE3]">
            {partner.name}
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 flex-shrink-0">
            {partner.type}
          </span>
        </div>
        {partner.description && (
          <p className="text-sm text-muted dark:text-[#7A7264] line-clamp-2 mb-2">
            {partner.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted dark:text-[#7A7264]">
          {partner.distance && <span>{partner.distance}</span>}
          {partner.walk_time && (
            <>
              <span className="w-1 h-1 bg-gold/40 rounded-full" />
              <span>{partner.walk_time} walk</span>
            </>
          )}
        </div>
        {partner.link && (
          <a
            href={partner.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-xs font-mono text-gold hover:underline"
          >
            Visit Website &#8599;
          </a>
        )}
      </div>
    </div>
  );
}
