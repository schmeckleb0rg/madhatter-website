"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/comedians", label: "Comedians" },
  { href: "/open-mic", label: "Open Mic" },
  { href: "/classes", label: "Classes" },
  { href: "/merch", label: "Merch" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
            href="/tickets"
            className="px-4 py-2 bg-charcoal text-off-white text-sm font-semibold hover:bg-charcoal-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Book Now
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

      {/* Mobile menu — animated slide */}
      <div
        className={`md:hidden bg-off-white border-t border-charcoal/10 px-4 overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 py-4 opacity-100" : "max-h-0 py-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href ? "text-charcoal" : "text-muted hover:text-charcoal"
              }`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/tickets"
            className="px-4 py-2 bg-charcoal text-off-white text-sm font-semibold text-center"
            onClick={() => setOpen(false)}
          >
            Book Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
