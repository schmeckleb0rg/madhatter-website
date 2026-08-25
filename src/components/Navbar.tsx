"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const eventsSubItems = [
  { href: "/events", label: "Events" },
  { href: "/open-mic", label: "Open Mic" },
  { href: "/classes", label: "Classes" },
  { href: "/private-events", label: "Private Events" },
];

const navLinks = [
  { href: "/comedians", label: "Comedians" },
  { href: "/rooms", label: "Rooms" },
  { href: "/merch", label: "Merch" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [mobileEventsOpen, setMobileEventsOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
    setEventsOpen(false);
    setMobileEventsOpen(false);
  }, [pathname]);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEventsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isEventsActive = eventsSubItems.some((item) => pathname === item.href);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-off-white/95 dark:bg-[#0D0C0A]/95 backdrop-blur-md border-b border-charcoal/10 dark:border-gold/10 shadow-sm"
          : "bg-off-white/90 dark:bg-[#0D0C0A]/90 backdrop-blur border-b border-charcoal/10 dark:border-gold/10"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3] tracking-wide group-hover:text-gold transition-colors duration-300">
            Mad Hatter
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {/* Events dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setEventsOpen(!eventsOpen)}
              className={`text-sm font-medium relative pb-0.5 flex items-center gap-1 after:absolute after:left-0 after:-bottom-0.5 after:h-px after:bg-gold after:transition-all after:duration-300 ${
                isEventsActive
                  ? "text-charcoal dark:text-[#F0ECE3] after:w-full"
                  : "text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] after:w-0 hover:after:w-full"
              }`}
            >
              Events
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${eventsOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Dropdown menu */}
            <div
              className={`absolute top-full left-0 mt-2 w-48 bg-off-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 shadow-lg transition-all duration-200 ${
                eventsOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              {eventsSubItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setEventsOpen(false)}
                  className={`block px-4 py-2.5 text-sm transition-colors ${
                    pathname === item.href
                      ? "text-charcoal dark:text-[#F0ECE3] bg-off-white-2 dark:bg-[#242119] font-medium"
                      : "text-muted dark:text-[#C4BDA8] hover:text-charcoal dark:hover:text-[#F0ECE3] hover:bg-off-white-2 dark:hover:bg-[#242119]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium relative pb-0.5 after:absolute after:left-0 after:-bottom-0.5 after:h-px after:bg-gold after:transition-all after:duration-300 ${
                pathname === link.href
                  ? "text-charcoal dark:text-[#F0ECE3] after:w-full"
                  : "text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] after:w-0 hover:after:w-full"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            href="/contact"
            className="px-4 py-2 bg-charcoal dark:bg-gold text-off-white dark:text-[#0D0C0A] text-sm font-semibold hover:bg-charcoal-2 dark:hover:bg-[#D4A84B] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] btn-shimmer"
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            className="flex items-center justify-center w-11 h-11 -mr-2 text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden bg-off-white dark:bg-[#0D0C0A] border-t border-charcoal/10 dark:border-gold/10 overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col px-4 py-3 overflow-y-auto">
          {/* Events expandable */}
          <button
            onClick={() => setMobileEventsOpen(!mobileEventsOpen)}
            className={`flex items-center justify-between text-base font-medium py-3 transition-colors ${
              isEventsActive ? "text-charcoal dark:text-[#F0ECE3]" : "text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3]"
            }`}
          >
            Events
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${mobileEventsOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              mobileEventsOpen ? "max-h-56 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="pl-4 flex flex-col border-l-2 border-gold/20 ml-2 mb-1">
              {eventsSubItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm py-2.5 transition-colors ${
                    pathname === item.href ? "text-charcoal dark:text-[#F0ECE3] font-medium" : "text-muted dark:text-[#C4BDA8] hover:text-charcoal dark:hover:text-[#F0ECE3]"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-base font-medium py-3 transition-colors border-t border-charcoal/5 dark:border-gold/5 ${
                pathname === link.href ? "text-charcoal dark:text-[#F0ECE3]" : "text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3]"
              }`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="mt-3 mb-1 py-3.5 bg-charcoal dark:bg-gold text-off-white dark:text-[#0D0C0A] text-sm font-semibold text-center active:scale-[0.98] transition-transform btn-shimmer"
            onClick={() => setOpen(false)}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </nav>
  );
}
