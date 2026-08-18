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
    <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a] border-b border-club-border">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="text-club-gold">🎩</span>
            <span className="text-sm font-bold text-white">Mad Hatter Admin</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${
                  pathname.startsWith(item.href)
                    ? "bg-club-card text-white"
                    : "text-gray-500 hover:text-white"
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
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            View Site ↗
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-xs text-gray-600 hover:text-club-red transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
