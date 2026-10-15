"use client";

import Link from "next/link";

type Event = {
  id: string;
  title: string;
  date: string;
  image_url: string | null;
};

type GenrePopupProps = {
  genre: { name: string; color: string };
  events: Event[];
  onClose: () => void;
};

export default function GenrePopup({ genre, events, onClose }: GenrePopupProps) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-off-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 w-full max-w-md max-h-[70vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-off-white dark:bg-[#1C1A16] px-5 py-4 border-b border-charcoal/10 dark:border-gold/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: genre.color }}
            />
            <h3 className="font-display text-lg font-semibold text-charcoal dark:text-[#F0ECE3]">
              {genre.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted dark:text-muted-dark hover:text-charcoal dark:hover:text-off-white text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="p-5 space-y-2">
          {events.length === 0 ? (
            <p className="text-sm text-muted dark:text-[#7A7264] py-4 text-center">
              No upcoming events in this genre.
            </p>
          ) : (
            events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex items-center gap-3 p-3 hover:bg-charcoal/5 dark:hover:bg-white/5 transition-colors rounded"
                onClick={onClose}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal dark:text-[#F0ECE3] truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted dark:text-[#7A7264]">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-xs text-gold">&rarr;</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
