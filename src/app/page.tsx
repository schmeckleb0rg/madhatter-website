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
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: `url('${background}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#000",
      }}
    />
  );
}
