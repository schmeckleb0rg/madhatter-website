import { supabase } from "@/lib/supabase";

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
  const bgStyle = {
    position: "fixed" as const,
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: "#000",
  };
  return (
    <div style={{ ...bgStyle, backgroundImage: `url('${background}')` }} />
  );
}
