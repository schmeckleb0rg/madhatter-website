"use client";

import { useState, useMemo } from "react";
import type { Event } from "@/lib/supabase";

type EventCalendarProps = {
  events: Event[];
  onEventClick: (event: Event) => void;
};

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DAYS_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getCategoryStyle(category?: string): string {
  switch (category) {
    case "weekly":
      return "bg-gold/15 text-gold dark:bg-gold/20";
    case "festival":
      return "bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400";
    case "live-taping":
      return "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400";
    default:
      return "bg-charcoal/8 text-charcoal dark:bg-white/10 dark:text-[#C4BDA8]";
  }
}

function getCategoryLabel(category?: string): string {
  switch (category) {
    case "weekly": return "Weekly";
    case "festival": return "Festival";
    case "live-taping": return "Live Taping";
    default: return "";
  }
}

function formatShortTime(time: string): string {
  try {
    // Handle "7:00 PM" format
    const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return time;
    let hour = parseInt(match[1]);
    const min = match[2];
    const ampm = match[3];

    if (ampm) {
      const suffix = ampm.toLowerCase() === "pm" ? "p" : "a";
      return `${hour}${min !== "00" ? ":" + min : ""}${suffix}`;
    }
    // 24h format
    const suffix = hour >= 12 ? "p" : "a";
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour}${min !== "00" ? ":" + min : ""}${suffix}`;
  } catch {
    return time;
  }
}

export default function EventCalendar({ events, onEventClick }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Build map of date string -> events
  const eventsByDate = useMemo(() => {
    const map: Record<string, Event[]> = {};
    events.forEach((event) => {
      const dateKey = event.date.split("T")[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(event);
    });
    // Sort events within each day by show_time
    Object.values(map).forEach((dayEvents) => {
      dayEvents.sort((a, b) => (a.show_time || "").localeCompare(b.show_time || ""));
    });
    return map;
  }, [events]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentMonth.year, currentMonth.month, 1);
    const lastDay = new Date(currentMonth.year, currentMonth.month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: string | null; day: number | null }[] = [];

    for (let i = 0; i < startPad; i++) {
      days.push({ date: null, day: null });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ date: dateStr, day: d });
    }

    return days;
  }, [currentMonth]);

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  function prevMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
    setSelectedDate(null);
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
    setSelectedDate(null);
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-charcoal/10 dark:border-gold/10">
        <button
          onClick={prevMonth}
          className="text-muted hover:text-charcoal dark:text-[#7A7264] dark:hover:text-[#F0ECE3] transition-colors p-2"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-display text-base sm:text-lg font-semibold text-charcoal dark:text-[#F0ECE3]">
          {MONTHS[currentMonth.month]} {currentMonth.year}
        </h3>
        <button
          onClick={nextMonth}
          className="text-muted hover:text-charcoal dark:text-[#7A7264] dark:hover:text-[#F0ECE3] transition-colors p-2"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-2 border-b border-charcoal/5 dark:border-gold/5 text-[10px]">
        <span className="text-muted dark:text-[#7A7264]">Categories:</span>
        {[
          { label: "General", style: getCategoryStyle("general") },
          { label: "Weekly", style: getCategoryStyle("weekly") },
          { label: "Festival", style: getCategoryStyle("festival") },
          { label: "Live Taping", style: getCategoryStyle("live-taping") },
        ].map((cat) => (
          <span key={cat.label} className={`px-1.5 py-0.5 rounded-sm ${cat.style}`}>
            {cat.label}
          </span>
        ))}
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-charcoal/10 dark:border-gold/10">
        {DAYS.map((day, i) => (
          <div key={i} className="py-2 text-center font-mono text-[10px] sm:text-xs text-muted dark:text-[#7A7264] uppercase tracking-wide">
            <span className="sm:hidden">{day}</span>
            <span className="hidden sm:inline">{DAYS_FULL[i]}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((cell, i) => {
          if (!cell.date || !cell.day) {
            return <div key={`pad-${i}`} className="min-h-[52px] sm:min-h-[100px] border-b border-r border-charcoal/5 dark:border-gold/5" />;
          }

          const dayEvents = eventsByDate[cell.date] || [];
          const hasEvents = dayEvents.length > 0;
          const isSelected = selectedDate === cell.date;
          const isToday = cell.date === todayStr;

          return (
            <button
              key={cell.date}
              onClick={() => setSelectedDate(isSelected ? null : cell.date)}
              className={`min-h-[52px] sm:min-h-[100px] border-b border-r border-charcoal/5 dark:border-gold/5 flex flex-col items-start p-1 sm:p-1.5 transition-colors text-left ${
                isSelected
                  ? "bg-charcoal text-off-white dark:bg-gold/20 dark:text-[#F0ECE3] ring-1 ring-inset ring-gold"
                  : hasEvents
                  ? "hover:bg-off-white-2 dark:hover:bg-[#242119] cursor-pointer"
                  : "cursor-default"
              }`}
            >
              {/* Day number */}
              <span
                className={`text-xs sm:text-sm leading-none ${
                  isSelected
                    ? "font-semibold"
                    : isToday
                    ? "font-bold text-gold"
                    : "text-charcoal dark:text-[#F0ECE3]"
                }`}
              >
                {cell.day}
              </span>

              {/* Mobile: dots */}
              {hasEvents && (
                <div className="flex gap-0.5 mt-1 sm:hidden">
                  {dayEvents.slice(0, 4).map((_, ei) => (
                    <span key={ei} className="w-1.5 h-1.5 rounded-full bg-gold" />
                  ))}
                  {dayEvents.length > 4 && (
                    <span className="text-[8px] text-gold leading-none">+{dayEvents.length - 4}</span>
                  )}
                </div>
              )}

              {/* Desktop: event titles with times */}
              {hasEvents && (
                <div className="hidden sm:flex flex-col gap-0.5 mt-1 w-full overflow-hidden">
                  {dayEvents.slice(0, 3).map((event, ei) => (
                    <div
                      key={ei}
                      className={`text-[10px] leading-tight truncate px-1 py-0.5 rounded-sm ${getCategoryStyle(event.event_category)}`}
                      title={`${event.show_time ? event.show_time + " - " : ""}${event.title}${getCategoryLabel(event.event_category) ? " (" + getCategoryLabel(event.event_category) + ")" : ""}`}
                    >
                      {event.show_time && (
                        <span className="font-mono opacity-70">{formatShortTime(event.show_time)} </span>
                      )}
                      <span className="font-medium">{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className={`text-[10px] px-1 ${isSelected ? "text-off-white/70 dark:text-[#C4BDA8]" : "text-muted dark:text-[#7A7264]"}`}>
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date events */}
      {selectedDate && (
        <div className="border-t border-charcoal/10 dark:border-gold/10 dark:bg-[#161412] p-4">
          <h4 className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            {selectedEvents.length > 0 && (
              <span className="ml-2 text-muted dark:text-[#7A7264]">
                ({selectedEvents.length} {selectedEvents.length === 1 ? "show" : "shows"})
              </span>
            )}
          </h4>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted">No events on this date.</p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="w-full text-left bg-off-white-2 dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-3 hover:border-gold/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-charcoal dark:text-[#F0ECE3] truncate">{event.title}</p>
                        {event.event_category !== "general" && (
                          <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-sm ${getCategoryStyle(event.event_category)}`}>
                            {getCategoryLabel(event.event_category)}
                          </span>
                        )}
                      </div>
                      {event.show_time && (
                        <p className="text-xs text-muted dark:text-[#7A7264] font-mono mt-0.5">{event.show_time}</p>
                      )}
                      {event.performer && (
                        <p className="text-xs text-muted dark:text-[#7A7264] mt-0.5 truncate">{event.performer}</p>
                      )}
                    </div>
                    {event.is_sold_out ? (
                      <span className="flex-shrink-0 font-mono text-xs px-2 py-0.5" style={{ color: "#9C4A38", backgroundColor: "rgba(156,74,56,0.10)" }}>
                        Sold out
                      </span>
                    ) : event.ticket_price_cents ? (
                      <span className="flex-shrink-0 font-mono text-xs text-gold">
                        ${(event.ticket_price_cents / 100).toFixed(2)}
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
