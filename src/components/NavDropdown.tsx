"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

type NavDropdownProps = {
  label: string;
  href: string;
  items: NavItem[];
};

export default function NavDropdown({ label, href, items }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = pathname === href || items.some((item) => pathname.startsWith(item.href.split("?")[0]));

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={href}
        className={`text-sm font-medium relative pb-0.5 flex items-center gap-1 after:absolute after:left-0 after:-bottom-0.5 after:h-px after:bg-gold after:transition-all after:duration-300 ${
          isActive
            ? "text-charcoal dark:text-[#F0ECE3] after:w-full"
            : "text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] after:w-0 hover:after:w-full"
        }`}
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Link>
      <div
        className={`absolute top-full left-0 mt-2 w-52 bg-off-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 shadow-lg transition-all duration-200 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        {items.map((item) => {
          const basePath = item.href.split("?")[0];
          const isItemActive = pathname === basePath || pathname.startsWith(basePath + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2.5 text-sm transition-colors ${
                isItemActive
                  ? "text-charcoal dark:text-[#F0ECE3] bg-off-white-2 dark:bg-[#242119] font-medium"
                  : "text-muted dark:text-[#C4BDA8] hover:text-charcoal dark:hover:text-[#F0ECE3] hover:bg-off-white-2 dark:hover:bg-[#242119]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
