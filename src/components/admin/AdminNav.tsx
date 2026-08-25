"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/comedians", label: "Comedians" },
  { href: "/admin/past-events", label: "Past Shows" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/merch", label: "Merch" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/slideshow", label: "Slideshow" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/messaging", label: "Messaging" },
  { href: "/admin/private-inquiries", label: "Private" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/site", label: "Site" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const userName = session?.user?.name;

  // Hide nav on login page
  if (pathname === "/admin/login") return null;

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-charcoal flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-off-white/10">
        <Link href="/admin/dashboard">
          <span className="font-display text-base font-semibold text-off-white leading-tight block">
            Mad Hatter
          </span>
          <span className="font-mono text-[10px] text-muted-dark uppercase tracking-widest">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 text-xs rounded transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-charcoal-2 text-off-white"
                  : "text-muted-dark hover:text-off-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {role === "manager" && (
            <Link
              href="/admin/users"
              className={`flex items-center px-3 py-2 text-xs rounded transition-colors ${
                pathname.startsWith("/admin/users")
                  ? "bg-charcoal-2 text-off-white"
                  : "text-muted-dark hover:text-off-white hover:bg-white/5"
              }`}
            >
              Users
            </Link>
          )}
        </div>
      </nav>

      {/* Bottom: profile + actions */}
      <div className="px-5 py-4 border-t border-off-white/10 space-y-2">
        <Link
          href="/admin/profile"
          className={`block text-xs truncate transition-colors ${
            pathname === "/admin/profile" ? "text-off-white" : "text-muted-dark hover:text-off-white"
          }`}
        >
          {userName || "Profile"}
        </Link>
        <Link
          href="/"
          target="_blank"
          className="block text-xs text-muted-dark hover:text-off-white transition-colors"
        >
          View Site ↗
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="block text-xs text-muted-dark hover:text-gold transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
