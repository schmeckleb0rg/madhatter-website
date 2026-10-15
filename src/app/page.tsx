import { supabase } from "@/lib/supabase";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60;

async function getHomeSettings() {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", [
      "background_url",
      "mobile_background_url",
      "hero_video_url",
      "hero_video_type",
    ]);

  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return {
    desktop: map.background_url || "/coming-soon.svg",
    mobile: map.mobile_background_url || null,
    heroVideoUrl: map.hero_video_url || null,
    heroVideoType: (map.hero_video_type as "upload" | "youtube" | "vimeo" | "none") || "none",
  };
}

export default async function HomePage() {
  const settings = await getHomeSettings();

  return (
    <HomeClient
      background={settings.desktop}
      mobileBackground={settings.mobile}
      heroVideoUrl={settings.heroVideoUrl}
      heroVideoType={settings.heroVideoType}
    />
  );
}
