"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import NavDropdown from "@/components/NavDropdown";

type DropdownNav = {
  label: string;
  href: string;
  items: { href: string; label: string }[];
};

type SimpleNav = {
  href: string;
  label: string;
};

const dropdownNavs: DropdownNav[] = [
  {
    label: "Events",
    href: "/events",
    items: [
      { href: "/events", label: "All Events" },
      { href: "/events?filter=weekly", label: "Weekly Shows" },
      { href: "/events?filter=festival", label: "Festivals" },
      { href: "/events?filter=live-taping", label: "Live Tapings" },
    ],
  },
  {
    label: "Classes",
    href: "/classes",
    items: [
      { href: "/classes", label: "All Classes" },
      { href: "/classes?type=improv", label: "Improv" },
      { href: "/classes?type=standup", label: "Standup" },
    ],
  },
  {
    label: "Event Space",
    href: "/event-spaces",
    items: [
      { href: "/event-spaces", label: "All Event Spaces" },
      { href: "/event-spaces?type=private", label: "Private Events" },
      { href: "/event-spaces/corporate", label: "Corporate Events" },
      { href: "/event-spaces/podcast", label: "Podcast Studio" },
    ],
  },
];

const simpleNavs: SimpleNav[] = [
  { href: "/comedians", label: "Comedians" },
  { href: "/merch", label: "Merch" },
];

const aboutNav: DropdownNav = {
  label: "About",
  href: "/about",
  items: [
    { href: "/about", label: "About MadHatter" },
    { href: "/staff", label: "Our Staff" },
    { href: "/patrons", label: "Our Patrons" },
    { href: "/contact", label: "Contact" },
    { href: "/press", label: "In The News" },
    { href: "/past-events", label: "Past Productions" },
    { href: "/employment", label: "Employment" },
    { href: "/policies", label: "Policies & Procedures" },
    { href: "/faqs", label: "FAQs" },
  ],
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
    setExpandedMobile(null);
  }, [pathname]);

  const allDropdowns = [...dropdownNavs, aboutNav];

  function toggleMobileSection(label: string) {
    setExpandedMobile((prev) => (prev === label ? null : label));
  }

  function isDropdownActive(nav: DropdownNav) {
    return pathname === nav.href || nav.items.some((item) => {
      const basePath = item.href.split("?")[0];
      return pathname === basePath || pathname.startsWith(basePath + "/");
    });
  }

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
        <div className="hidden lg:flex items-center gap-6">
          {dropdownNavs.map((nav) => (
            <NavDropdown key={nav.label} label={nav.label} href={nav.href} items={nav.items} />
          ))}
          {simpleNavs.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium relative pb-0.5 after:absolute after:left-0 after:-bottom-0.5 after:h-px after:bg-gold after:transition-all after:duration-300 ${
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "text-charcoal dark:text-[#F0ECE3] after:w-full"
                  : "text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] after:w-0 hover:after:w-full"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <NavDropdown label={aboutNav.label} href={aboutNav.href} items={aboutNav.items} />
          <ThemeToggle />
          <Link
            href="/gift-cards"
            className="px-4 py-2 bg-charcoal dark:bg-gold text-off-white dark:text-[#0D0C0A] text-sm font-semibold hover:bg-charcoal-2 dark:hover:bg-[#D4A84B] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] btn-shimmer"
          >
            Gift Cards
          </Link>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="lg:hidden flex items-center gap-1">
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
        className={`lg:hidden bg-off-white dark:bg-[#0D0C0A] border-t border-charcoal/10 dark:border-gold/10 overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col px-4 py-3 overflow-y-auto max-h-[75vh]">
          {/* Dropdown sections as accordions */}
          {allDropdowns.map((nav) => (
            <div key={nav.label}>
              <button
                onClick={() => toggleMobileSection(nav.label)}
                className={`flex items-center justify-between w-full text-base font-medium py-3 transition-colors border-b border-charcoal/5 dark:border-gold/5 ${
                  isDropdownActive(nav) ? "text-charcoal dark:text-[#F0ECE3]" : "text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3]"
                }`}
              >
                {nav.label}
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${expandedMobile === nav.label ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  expandedMobile === nav.label ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="pl-4 flex flex-col border-l-2 border-gold/20 ml-2 mb-1">
                  {nav.items.map((item) => {
                    const basePath = item.href.split("?")[0];
                    const isItemActive = pathname === basePath;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`text-sm py-2.5 transition-colors ${
                          isItemActive ? "text-charcoal dark:text-[#F0ECE3] font-medium" : "text-muted dark:text-[#C4BDA8] hover:text-charcoal dark:hover:text-[#F0ECE3]"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Simple nav links */}
          {simpleNavs.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-base font-medium py-3 transition-colors border-b border-charcoal/5 dark:border-gold/5 ${
                pathname === link.href ? "text-charcoal dark:text-[#F0ECE3]" : "text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3]"
              }`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/gift-cards"
            className="mt-3 mb-1 py-3.5 bg-charcoal dark:bg-gold text-off-white dark:text-[#0D0C0A] text-sm font-semibold text-center active:scale-[0.98] transition-transform btn-shimmer"
            onClick={() => setOpen(false)}
          >
            Gift Cards
          </Link>
        </div>
      </div>
    </nav>
  );
}
