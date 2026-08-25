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
    return map;
  }, [events]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentMonth.year, currentMonth.month, 1);
    const lastDay = new Date(currentMonth.year, currentMonth.month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: string | null; day: number | null }[] = [];

    // Padding for start of month
    for (let i = 0; i < startPad; i++) {
      days.push({ date: null, day: null });
    }

    // Actual days
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

      {/* Day labels — short on mobile, full on desktop */}
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
            return <div key={`pad-${i}`} className="aspect-square border-b border-r border-charcoal/5" />;
          }

          const hasEvents = !!eventsByDate[cell.date];
          const isSelected = selectedDate === cell.date;
          const isToday = cell.date === todayStr;

          return (
            <button
              key={cell.date}
              onClick={() => setSelectedDate(isSelected ? null : cell.date)}
              className={`aspect-square border-b border-r border-charcoal/5 flex flex-col items-center justify-center gap-1 transition-colors relative ${
                isSelected
                  ? "bg-charcoal text-off-white dark:bg-gold dark:text-[#0D0C0A]"
                  : hasEvents
                  ? "hover:bg-off-white-2 dark:hover:bg-[#242119] cursor-pointer"
                  : "cursor-default"
              }`}
            >
              <span
                className={`text-xs sm:text-sm ${
                  isSelected
                    ? "font-semibold text-off-white dark:text-[#0D0C0A]"
                    : isToday
                    ? "font-bold text-gold"
                    : "text-charcoal dark:text-[#F0ECE3]"
                }`}
              >
                {cell.day}
              </span>
              {hasEvents && (
                <div className="flex gap-0.5">
                  {eventsByDate[cell.date!].slice(0, 3).map((_, ei) => (
                    <span
                      key={ei}
                      className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gold"
                    />
                  ))}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-charcoal dark:text-[#F0ECE3]">{event.title}</p>
                      {event.show_time && (
                        <p className="text-xs text-muted dark:text-[#7A7264] font-mono mt-0.5">{event.show_time}</p>
                      )}
                    </div>
                    {event.is_sold_out ? (
                      <span className="font-mono text-xs px-2 py-0.5" style={{ color: "#9C4A38", backgroundColor: "rgba(156,74,56,0.10)" }}>
                        Sold out
                      </span>
                    ) : event.ticket_price_cents ? (
                      <span className="font-mono text-xs text-gold">
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
