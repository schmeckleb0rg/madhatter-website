import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { SocialLinks } from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import { getVenueInfo } from "@/lib/venue";
import { supabase } from "@/lib/supabase";

export const revalidate = 300;

async function getSocialLinks(): Promise<SocialLinks> {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", [
      "social_instagram",
      "social_tiktok",
      "social_facebook",
      "social_youtube",
    ]);

  const s: Record<string, string> = {};
  (data ?? []).forEach((row: { key: string; value: string }) => {
    if (row.value) s[row.key] = row.value;
  });

  return {
    instagram: s.social_instagram || undefined,
    tiktok: s.social_tiktok || undefined,
    facebook: s.social_facebook || undefined,
    youtube: s.social_youtube || undefined,
  };
}

async function getAccessibilityStatement(): Promise<string | undefined> {
  const { data } = await supabase
    .from("page_content")
    .select("content")
    .eq("page_key", "accessibility")
    .eq("section_key", "statement")
    .single();
  return data?.content || undefined;
}

async function getTermsStatement(): Promise<string | undefined> {
  const { data } = await supabase
    .from("page_content")
    .select("content")
    .eq("page_key", "terms")
    .eq("section_key", "statement")
    .single();
  return data?.content || undefined;
}

async function getPrivacyStatement(): Promise<string | undefined> {
  const { data } = await supabase
    .from("page_content")
    .select("content")
    .eq("page_key", "privacy")
    .eq("section_key", "statement")
    .single();
  return data?.content || undefined;
}

const PAGE_VISIBILITY_KEYS = [
  "page_visible_festivals",
  "page_visible_classes",
  "page_visible_staff",
  "page_visible_patrons",
  "page_visible_press",
  "page_visible_past_events",
  "page_visible_comedians",
  "page_visible_merch",
];

async function getHiddenPages(): Promise<string[]> {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", PAGE_VISIBILITY_KEYS);

  const hidden: string[] = [];
  (data ?? []).forEach((row: { key: string; value: string }) => {
    if (row.value === "false") {
      // Extract key name: "page_visible_festivals" → "festivals"
      hidden.push(row.key.replace("page_visible_", ""));
    }
  });
  return hidden;
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [venue, socialLinks, accessibilityStatement, termsStatement, privacyStatement, hiddenPages] = await Promise.all([
    getVenueInfo(),
    getSocialLinks(),
    getAccessibilityStatement(),
    getTermsStatement(),
    getPrivacyStatement(),
    getHiddenPages(),
  ]);

  return (
    <ThemeProvider>
      {/* Skip navigation — visible only on keyboard focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-charcoal focus:text-off-white focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>
      <Navbar hiddenPages={hiddenPages} />
      <div className="lg:ml-[220px]">
        <main id="main-content">{children}</main>
        <Footer venue={venue} socialLinks={socialLinks} accessibilityStatement={accessibilityStatement} termsStatement={termsStatement} privacyStatement={privacyStatement} hiddenPages={hiddenPages} />
      </div>
    </ThemeProvider>
  );
}
