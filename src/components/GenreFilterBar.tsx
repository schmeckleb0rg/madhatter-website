"use client";

import type { EventGenre } from "@/lib/supabase";

type GenreFilterBarProps = {
  genres: EventGenre[];
  selected: string[];
  onToggle: (genreId: string) => void;
};

export default function GenreFilterBar({ genres, selected, onToggle }: GenreFilterBarProps) {
  if (genres.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        type="button"
        onClick={() => selected.length > 0 && selected.forEach(onToggle)}
        className={`flex-shrink-0 font-mono text-xs tracking-wide px-3 py-1.5 transition-colors ${
          selected.length === 0
            ? "bg-charcoal text-off-white dark:bg-gold dark:text-[#0D0C0A]"
            : "border border-charcoal/20 text-muted hover:text-charcoal dark:border-gold/20 dark:text-[#7A7264] dark:hover:text-[#F0ECE3]"
        }`}
      >
        All
      </button>
      {genres.map((genre) => {
        const isActive = selected.includes(genre.id);
        return (
          <button
            key={genre.id}
            type="button"
            onClick={() => onToggle(genre.id)}
            className="flex-shrink-0 font-mono text-xs tracking-wide px-3 py-1.5 rounded-full transition-all duration-200"
            style={{
              color: isActive ? "#fff" : genre.color,
              backgroundColor: isActive ? genre.color : "transparent",
              border: `1px solid ${genre.color}${isActive ? "" : "40"}`,
            }}
          >
            {genre.name}
          </button>
        );
      })}
    </div>
  );
}
