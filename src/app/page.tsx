import { supabase } from "@/lib/supabase";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60;

async function getBackgrounds(): Promise<{ desktop: string; mobile: string | null }> {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["background_url", "mobile_background_url"]);

  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return {
    desktop: map.background_url || "/coming-soon.svg",
    mobile: map.mobile_background_url || null,
  };
}

export default async function HomePage() {
  const bg = await getBackgrounds();

  return <HomeClient background={bg.desktop} mobileBackground={bg.mobile} />;
}
