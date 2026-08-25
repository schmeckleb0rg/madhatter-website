import { supabase } from "@/lib/supabase";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60;

async function getBackground(): Promise<string> {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "background_url")
    .single();
  return data?.value || "/coming-soon.svg";
}

export default async function HomePage() {
  const background = await getBackground();

  return <HomeClient background={background} />;
}
