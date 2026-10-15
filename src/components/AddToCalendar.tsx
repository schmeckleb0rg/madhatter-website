"use client";

import { useState, useRef, useEffect } from "react";

type AddToCalendarProps = {
  title: string;
  date: string; // ISO date string
  durationMinutes?: number;
  location: string;
  description?: string;
  eventUrl?: string;
  doorsTime?: string;
};

function formatDateForGoogle(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function formatDateForICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function buildDescription(props: AddToCalendarProps): string {
  const parts: string[] = [];
  if (props.description) parts.push(props.description);
  if (props.doorsTime) parts.push(`Doors open at ${props.doorsTime}.`);
  parts.push("Enjoy live comedy at Mad Hatter Comedy Club. Full bar available. 21+ show.");
  if (props.eventUrl) parts.push(`Tickets & Info: ${props.eventUrl}`);
  return parts.join("\n");
}

export default function AddToCalendar(props: AddToCalendarProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const duration = props.durationMinutes || 120;

  const startDate = new Date(props.date);
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
  const desc = buildDescription(props);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Google Calendar
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(props.title)}&dates=${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}&details=${encodeURIComponent(desc)}&location=${encodeURIComponent(props.location)}`;

  // Outlook
  const outlookUrl = `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(props.title)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(desc)}&location=${encodeURIComponent(props.location)}`;

  // ICS file download
  function downloadICS() {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Mad Hatter Comedy Club//Events//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `DTSTART:${formatDateForICS(startDate)}`,
      `DTEND:${formatDateForICS(endDate)}`,
      `SUMMARY:${props.title}`,
      `DESCRIPTION:${desc.replace(/\n/g, "\\n")}`,
      `LOCATION:${props.location}`,
      props.eventUrl ? `URL:${props.eventUrl}` : "",
      "BEGIN:VALARM",
      "TRIGGER:-PT60M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${props.title} starts in 1 hour`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.title.replace(/[^a-zA-Z0-9]/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  const itemClass =
    "flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted dark:text-[#C4BDA8] hover:text-charcoal dark:hover:text-[#F0ECE3] hover:bg-off-white-2 dark:hover:bg-[#242119] transition-colors";

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-4 py-2 border border-charcoal/10 dark:border-gold/10 text-sm font-medium text-charcoal dark:text-[#F0ECE3] hover:border-gold/40 dark:hover:border-gold/30 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        Add to Calendar
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        className={`absolute top-full left-0 mt-1 w-52 bg-off-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 shadow-lg z-20 transition-all duration-200 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={itemClass}
          onClick={() => setOpen(false)}
        >
          <svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm1-8h4v2h-6V7h2v5z" />
          </svg>
          Google Calendar
        </a>
        <button onClick={downloadICS} className={itemClass}>
          <svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Apple Calendar
        </button>
        <a
          href={outlookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={itemClass}
          onClick={() => setOpen(false)}
        >
          <svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11H8v2h3v3h2v-3h3v-2h-3V8h-2v3z" />
          </svg>
          Outlook
        </a>
      </div>
    </div>
  );
}
