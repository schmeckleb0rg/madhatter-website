"use client";

import type { EventGenre } from "@/lib/supabase";

type GenreBadgeProps = {
  genre: EventGenre;
  onClick?: () => void;
  size?: "sm" | "md";
};

export default function GenreBadge({ genre, onClick, size = "sm" }: GenreBadgeProps) {
  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono font-medium tracking-wider uppercase rounded-full transition-all duration-200 hover:scale-105 ${sizeClass}`}
      style={{
        color: genre.color,
        background: `linear-gradient(135deg, ${genre.color}15, ${genre.color}08)`,
        border: `1px solid ${genre.color}30`,
      }}
    >
      {genre.name}
    </button>
  );
}
