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
    <>
      {/* Mobile */}
      <img
        src="/madhatter_mobileComingsoon.svg"
        alt=""
        className="sm:hidden"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* Desktop */}
      <div
        className="hidden sm:block"
        style={{ ...bgStyle, backgroundImage: `url('${background}')` }}
      />
    </>
  );
}
