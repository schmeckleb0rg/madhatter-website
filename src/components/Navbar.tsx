"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

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
          ? "bg-off-white/95 backdrop-blur-md border-b border-charcoal/10 shadow-sm"
          : "bg-off-white/90 backdrop-blur border-b border-charcoal/10"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-display text-xl font-semibold text-charcoal tracking-wide group-hover:text-gold transition-colors duration-300">
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
                  ? "text-charcoal after:w-full"
                  : "text-muted hover:text-charcoal after:w-0 hover:after:w-full"
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
              className={`absolute top-full left-0 mt-2 w-48 bg-off-white border border-charcoal/10 shadow-lg transition-all duration-200 ${
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
                      ? "text-charcoal bg-off-white-2 font-medium"
                      : "text-muted hover:text-charcoal hover:bg-off-white-2"
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
                  ? "text-charcoal after:w-full"
                  : "text-muted hover:text-charcoal after:w-0 hover:after:w-full"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="px-4 py-2 bg-charcoal text-off-white text-sm font-semibold hover:bg-charcoal-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-muted hover:text-charcoal transition-colors"
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

      {/* Mobile menu */}
      <div
        className={`md:hidden bg-off-white border-t border-charcoal/10 px-4 overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[500px] py-4 opacity-100" : "max-h-0 py-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1">
          {/* Events expandable */}
          <button
            onClick={() => setMobileEventsOpen(!mobileEventsOpen)}
            className={`flex items-center justify-between text-sm font-medium py-2 transition-colors ${
              isEventsActive ? "text-charcoal" : "text-muted hover:text-charcoal"
            }`}
          >
            Events
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${mobileEventsOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              mobileEventsOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="pl-4 flex flex-col gap-1 pb-2">
              {eventsSubItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm py-1.5 transition-colors ${
                    pathname === item.href ? "text-charcoal font-medium" : "text-muted hover:text-charcoal"
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
              className={`text-sm font-medium py-2 transition-colors ${
                pathname === link.href ? "text-charcoal" : "text-muted hover:text-charcoal"
              }`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="px-4 py-2 mt-2 bg-charcoal text-off-white text-sm font-semibold text-center"
            onClick={() => setOpen(false)}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </nav>
  );
}
