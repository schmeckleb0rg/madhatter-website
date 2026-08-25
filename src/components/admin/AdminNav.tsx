"use client";

import { useState, useEffect } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mobileOpen]);

  // Hide nav on login page
  if (pathname === "/admin/login") return null;

  const navContent = (
    <>
      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 lg:py-2 text-sm lg:text-xs rounded transition-colors ${
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
              className={`flex items-center px-3 py-2.5 lg:py-2 text-sm lg:text-xs rounded transition-colors ${
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
          className={`block text-sm lg:text-xs truncate transition-colors ${
            pathname === "/admin/profile" ? "text-off-white" : "text-muted-dark hover:text-off-white"
          }`}
        >
          {userName || "Profile"}
        </Link>
        <Link
          href="/"
          target="_blank"
          className="block text-sm lg:text-xs text-muted-dark hover:text-off-white transition-colors"
        >
          View Site ↗
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="block text-sm lg:text-xs text-muted-dark hover:text-gold transition-colors"
        >
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-charcoal flex items-center justify-between px-4 z-50">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="font-display text-sm font-semibold text-off-white">Mad Hatter</span>
          <span className="font-mono text-[9px] text-muted-dark uppercase tracking-widest">Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-10 h-10 flex items-center justify-center text-muted-dark hover:text-off-white transition-colors"
          aria-label="Toggle menu"
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

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-out drawer */}
      <aside
        className={`lg:hidden fixed top-14 left-0 bottom-0 w-64 bg-charcoal flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar — unchanged */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-56 bg-charcoal flex-col z-50">
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
        {navContent}
      </aside>
    </>
  );
}
