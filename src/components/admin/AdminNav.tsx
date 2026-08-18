"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/comedians", label: "Comedians" },
  { href: "/admin/past-events", label: "Past Shows" },
  { href: "/admin/merch", label: "Merch" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/site", label: "Site" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-charcoal border-b border-off-white/10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="font-display text-sm font-semibold text-off-white">Mad Hatter Admin</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  pathname.startsWith(item.href)
                    ? "bg-charcoal-2 text-off-white"
                    : "text-muted-dark hover:text-off-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="text-xs text-muted-dark hover:text-off-white transition-colors"
          >
            View Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-xs text-muted-dark hover:text-gold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
