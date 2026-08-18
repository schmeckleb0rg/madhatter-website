import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-club-card border-t border-club-border mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-club-gold text-2xl">🎩</span>
              <span
                className="text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Mad Hatter
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Chicago&apos;s premier comedy club. Laugh like you mean it.
            </p>
            <div className="mt-4 text-club-gold text-lg tracking-widest opacity-30">
              ♠ ♥ ♣ ♦
            </div>
          </div>

          {/* Shows */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Shows
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/events", label: "Upcoming Events" },
                { href: "/comedians", label: "Comedians" },
                { href: "/past-events", label: "Past Shows" },
                { href: "/open-mic", label: "Open Mic" },
                { href: "/tickets", label: "Tickets" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              More
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/classes", label: "Comedy Classes" },
                { href: "/merch", label: "Merch" },
                { href: "/press", label: "Media & Press" },
                { href: "/visitor-info", label: "Visitor Info" },
                { href: "/about", label: "About" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Find Us
            </h3>
            <address className="not-italic text-sm text-gray-400 space-y-1">
              <p>123 W Madison St</p>
              <p>Chicago, IL 60602</p>
              <p className="mt-3">
                <a
                  href="mailto:hello@madhattercomedy.com"
                  className="hover:text-white transition-colors"
                >
                  hello@madhattercomedy.com
                </a>
              </p>
              <p className="mt-2">
                <Link
                  href="/contact"
                  className="text-club-red hover:underline"
                >
                  Contact Us
                </Link>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-club-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Mad Hatter Comedy Club. All rights reserved.
          </p>
          <Link
            href="/admin/login"
            className="text-xs text-gray-700 hover:text-gray-500 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
