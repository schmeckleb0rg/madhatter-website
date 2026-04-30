import type { Metadata } from "next";
import "./globals.css";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

async function getSiteSettings(): Promise<Record<string, string>> {
  const { data } = await supabase.from("site_settings").select("key, value");
  const s: Record<string, string> = {};
  (data ?? []).forEach((row: { key: string; value: string }) => { s[row.key] = row.value; });
  return s;
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: s.seo_title || "Mad Hatter Comedy Club | Chicago",
    description: s.seo_description || "Chicago's premier comedy club. Live stand-up, improv, and more in the heart of the city.",
    keywords: s.seo_keywords || "comedy club, Chicago, stand-up, improv, live comedy, Mad Hatter",
    icons: s.favicon_url ? { icon: s.favicon_url } : undefined,
    openGraph: {
      title: s.og_title || s.seo_title || "Mad Hatter Comedy Club | Chicago",
      description: s.og_description || s.seo_description || "Chicago's premier comedy club.",
      type: "website",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
