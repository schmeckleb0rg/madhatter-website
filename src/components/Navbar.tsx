"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

type NavSection = {
  label: string;
  items: { href: string; label: string }[];
};

type SimpleNav = {
  href: string;
  label: string;
};

const navSections: NavSection[] = [
  {
    label: "Events",
    items: [
      { href: "/events", label: "All Events" },
      { href: "/events?filter=weekly", label: "Weekly Shows" },
      { href: "/events?filter=festival", label: "Festivals" },
      { href: "/events?filter=live-taping", label: "Live Tapings" },
    ],
  },
  {
    label: "Classes",
    items: [
      { href: "/classes", label: "All Classes" },
      { href: "/classes?type=improv", label: "Improv" },
      { href: "/classes?type=standup", label: "Standup" },
    ],
  },
  {
    label: "Event Space",
    items: [
      { href: "/event-spaces", label: "All Event Spaces" },
      { href: "/event-spaces?type=private", label: "Private Events" },
      { href: "/event-spaces/corporate", label: "Corporate Events" },
      { href: "/event-spaces/podcast", label: "Podcast Studio" },
    ],
  },
  {
    label: "About",
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
  },
];

const simpleNavs: SimpleNav[] = [
  { href: "/comedians", label: "Comedians" },
  { href: "/merch", label: "Merch" },
  { href: "/visitor-info", label: "Visitor Info" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile nav open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileOpen]);

  function isSectionActive(section: NavSection): boolean {
    return section.items.some((item) => {
      const basePath = item.href.split("?")[0];
      return pathname === basePath || pathname.startsWith(basePath + "/");
    });
  }

  function isLinkActive(href: string): boolean {
    const basePath = href.split("?")[0];
    return pathname === basePath || pathname.startsWith(basePath + "/");
  }

  // Auto-expand active section
  useEffect(() => {
    for (const section of navSections) {
      if (isSectionActive(section)) {
        setExpandedSection(section.label);
        return;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navContent = (
    <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Main navigation">
      {/* Accordion sections */}
      {navSections.map((section, sectionIndex) => {
        const isExpanded = expandedSection === section.label;
        const isActive = isSectionActive(section);

        return (
          <div key={section.label} className="nav-item-enter" style={{ animationDelay: `${sectionIndex * 60}ms` }}>
            <button
              onClick={() => setExpandedSection(isExpanded ? null : section.label)}
              aria-expanded={isExpanded}
              className={`nav-section-hover w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md transition-colors ${
                isActive
                  ? "text-gold font-medium"
                  : "text-charcoal/70 dark:text-[#C4BDA8] hover:text-charcoal dark:hover:text-[#F0ECE3]"
              }`}
            >
              <span>{section.label}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="accordion-enter ml-3 border-l-2 border-gold/20 pl-2 mb-1">
                {section.items.map((item, itemIndex) => {
                  const active = isLinkActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-link-glow nav-section-hover block px-3 py-2 text-sm rounded-md transition-colors nav-item-enter ${
                        active
                          ? "text-charcoal dark:text-[#F0ECE3] font-medium active"
                          : "text-charcoal/60 dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3]"
                      }`}
                      style={{ animationDelay: `${itemIndex * 40}ms` }}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Divider */}
      <div className="mx-3 my-2 border-t border-charcoal/10 dark:border-gold/10" />

      {/* Simple nav links */}
      {simpleNavs.map((link, i) => {
        const active = isLinkActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link-glow nav-section-hover block px-3 py-2.5 text-sm rounded-md transition-colors nav-item-enter ${
              active
                ? "text-charcoal dark:text-[#F0ECE3] font-medium active"
                : "text-charcoal/70 dark:text-[#C4BDA8] hover:text-charcoal dark:hover:text-[#F0ECE3]"
            }`}
            style={{ animationDelay: `${(navSections.length + i) * 60}ms` }}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        );
      })}

      {/* Gift Cards CTA */}
      <div className="px-3 mt-4 nav-item-enter" style={{ animationDelay: `${(navSections.length + simpleNavs.length) * 60}ms` }}>
        <Link
          href="/gift-cards"
          className="block py-3 bg-charcoal dark:bg-gold text-off-white dark:text-[#0D0C0A] text-sm font-semibold text-center rounded-md hover:bg-charcoal-2 dark:hover:bg-[#D4A84B] transition-all duration-200 active:scale-[0.98] btn-shimmer"
          onClick={() => setMobileOpen(false)}
        >
          Gift Cards
        </Link>
      </div>
    </nav>
  );

  return (
    <>
      {/* ── Mobile: fixed top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-off-white/95 dark:bg-[#0D0C0A]/95 backdrop-blur-md border-b border-charcoal/10 dark:border-gold/10 flex items-center justify-between px-4 z-50">
        <Link href="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
          <Image
            src="/MH LOGO.png"
            alt="Mad Hatter Comedy Club"
            width={100}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center w-11 h-11 -mr-2 text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile slide-out drawer */}
      <aside
        className={`lg:hidden fixed top-14 left-0 bottom-0 w-72 bg-off-white dark:bg-[#0D0C0A] border-r border-charcoal/10 dark:border-gold/10 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>

      {/* ── Desktop: fixed left sidebar ── */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-[220px] bg-off-white dark:bg-[#0D0C0A] border-r border-charcoal/10 dark:border-gold/10 flex-col z-50">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-charcoal/10 dark:border-gold/10 flex justify-center">
          <Link href="/" className="nav-logo block">
            <Image
              src="/MH LOGO.png"
              alt="Mad Hatter Comedy Club"
              width={160}
              height={120}
              className="w-auto h-auto max-h-24 object-contain"
              priority
            />
          </Link>
        </div>

        {/* Nav content */}
        {navContent}

        {/* Theme toggle at bottom */}
        <div className="px-5 py-4 border-t border-charcoal/10 dark:border-gold/10 flex items-center justify-between">
          <span className="text-xs text-charcoal/50 dark:text-[#7A7264]">Theme</span>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
