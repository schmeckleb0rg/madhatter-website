"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Event } from "@/lib/supabase";
import { formatDate } from "@/components/EventCard";

type EventDetailPopupProps = {
  event: Event | null;
  onClose: () => void;
};

export default function EventDetailPopup({ event, onClose }: EventDetailPopupProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (event) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKey);
        document.body.style.overflow = "";
      };
    }
  }, [event, onClose]);

  if (!event) return null;

  const date = formatDate(event.date);

  function handleShare() {
    const url = `${window.location.origin}/events#${event!.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4 sm:py-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 dark:bg-black/85 animate-fadeIn" />

      {/* Modal — slides up from bottom on mobile, centered on desktop */}
      <div className="relative bg-off-white dark:bg-[#1C1A16] w-full sm:max-w-2xl sm:border sm:border-charcoal/10 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-fadeInUp rounded-t-xl sm:rounded-none">
        {/* Drag handle on mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-charcoal/20 dark:bg-gold/20" />
        </div>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center bg-off-white/80 dark:bg-[#1C1A16]/80 backdrop-blur text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] transition-colors rounded-full sm:rounded-none"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Event image */}
        <div className="relative aspect-video bg-off-white-2 dark:bg-[#161412] overflow-hidden">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <svg className="w-16 h-16 text-gold/20" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5a3 3 0 013 3v6a3 3 0 01-6 0v-6a3 3 0 013-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5A7.5 7.5 0 0112 18m0 0v3m0 0H9m3 0h3" />
              </svg>
              <span className="font-display text-2xl text-muted/20">MH</span>
            </div>
          )}
          {event.is_sold_out && (
            <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
              <span className="font-mono text-off-white font-medium text-lg tracking-widest uppercase">Sold Out</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8">
          <div className="flex items-start gap-3 sm:gap-5 mb-6">
            {/* Date block */}
            <div className="flex-shrink-0 text-center w-14 sm:w-16 bg-off-white-2 dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 py-2.5 sm:py-3">
              <div className="font-mono text-[10px] sm:text-xs font-medium text-gold">{date.month}</div>
              <div className="text-2xl sm:text-3xl font-bold text-charcoal dark:text-[#F0ECE3] leading-none">{date.day}</div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-charcoal dark:text-[#F0ECE3] tracking-tight">
                {event.title}
              </h2>
              {event.performer && (
                <p className="text-muted dark:text-[#7A7264] mt-1">with {event.performer}</p>
              )}
              <p className="text-sm text-muted dark:text-[#7A7264] mt-1">{date.full}</p>
            </div>
          </div>

          {/* Time & Price */}
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 text-sm">
            {event.doors_time && (
              <div className="bg-off-white-2 dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 px-3 py-2">
                <span className="font-mono text-xs text-gold uppercase tracking-wide">Doors</span>
                <span className="ml-2 text-charcoal dark:text-[#F0ECE3]">{event.doors_time}</span>
              </div>
            )}
            {event.show_time && (
              <div className="bg-off-white-2 dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 px-3 py-2">
                <span className="font-mono text-xs text-gold uppercase tracking-wide">Show</span>
                <span className="ml-2 text-charcoal dark:text-[#F0ECE3]">{event.show_time}</span>
              </div>
            )}
            {(event.ticket_price_cents || event.ticket_price) && (
              <div className="bg-off-white-2 dark:bg-[#161412] border border-charcoal/10 dark:border-gold/10 px-3 py-2">
                <span className="font-mono text-xs text-gold uppercase tracking-wide">Price</span>
                <span className="ml-2 text-charcoal dark:text-[#F0ECE3] font-semibold">
                  {event.ticket_price_cents
                    ? `$${(event.ticket_price_cents / 100).toFixed(2)}`
                    : event.ticket_price}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {(event.detailed_description || event.description) && (
            <div className="mb-6">
              <p className="text-muted dark:text-[#C4BDA8] leading-relaxed whitespace-pre-line">
                {event.detailed_description || event.description}
              </p>
            </div>
          )}

          {/* Lineup */}
          {event.lineup && event.lineup.length > 0 && (
            <div className="mb-6">
              <h3 className="font-mono text-xs tracking-widest uppercase text-gold mb-3">Lineup</h3>
              <ul className="space-y-2">
                {event.lineup.map((act, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0" />
                    <span className="text-charcoal dark:text-[#F0ECE3] font-medium">{act.name}</span>
                    {act.role && <span className="text-muted dark:text-[#7A7264]">({act.role})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6 sm:mt-8">
            {!event.is_sold_out && (
              <>
                {event.ticket_price_cents && event.ticket_capacity ? (
                  <Link
                    href={`/tickets/${event.id}`}
                    className="btn-shimmer flex-1 text-center py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 dark:bg-gold dark:text-[#0D0C0A] dark:hover:bg-[#D4A84B] transition-all duration-200 active:scale-[0.98]"
                  >
                    Get Tickets
                  </Link>
                ) : (
                  <Link
                    href={`/tickets?event=${event.id}`}
                    className="btn-shimmer flex-1 text-center py-3 bg-charcoal text-off-white font-semibold hover:bg-charcoal-2 dark:border-gold/20 dark:text-[#F0ECE3] dark:hover:bg-gold dark:hover:text-[#0D0C0A] transition-all duration-200 active:scale-[0.98]"
                  >
                    Request Tickets
                  </Link>
                )}
              </>
            )}
            <button
              onClick={handleShare}
              className="px-4 py-3 border border-charcoal/20 dark:border-gold/20 text-charcoal dark:text-[#C4BDA8] text-sm font-medium hover:bg-off-white-2 transition-colors"
            >
              {copied ? "Copied!" : "Share"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
