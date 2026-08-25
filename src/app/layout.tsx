import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { supabase } from "@/lib/supabase";
import { LocalBusinessSchema } from "@/components/StructuredData";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { getVenueInfo } from "@/lib/venue";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

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
    icons: {
      icon: s.favicon_url || undefined,
      apple: s.app_icon_url || s.favicon_url || undefined,
    },
    manifest: "/manifest.json",
    openGraph: {
      title: s.og_title || s.seo_title || "Mad Hatter Comedy Club | Chicago",
      description: s.og_description || s.seo_description || "Chicago's premier comedy club.",
      type: "website",
      images: s.og_image_url ? [{ url: s.og_image_url, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      images: s.og_image_url ? [s.og_image_url] : undefined,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const venue = await getVenueInfo();

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="font-body">
        <GoogleAnalytics />
        <LocalBusinessSchema venue={venue} />
        {children}
      </body>
    </html>
  );
}
