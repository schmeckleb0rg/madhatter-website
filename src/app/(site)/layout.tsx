import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { SocialLinks } from "@/components/Footer";
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

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [venue, socialLinks] = await Promise.all([getVenueInfo(), getSocialLinks()]);

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer venue={venue} socialLinks={socialLinks} />
    </>
  );
}
