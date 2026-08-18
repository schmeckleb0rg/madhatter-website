import Link from "next/link";
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
      <div
        className="sm:hidden"
        style={{ ...bgStyle, backgroundImage: "url('/Mad%20Hatter_mobilebackgroung.png')" }}
      />
      {/* Desktop */}
      <div
        className="hidden sm:block"
        style={{ ...bgStyle, backgroundImage: `url('${background}')` }}
      />

      {/* Hidden access link */}
      <Link
        href="/events"
        aria-label="View site"
        className="fixed bottom-4 left-4 z-50 block h-[18px] w-[18px] rounded opacity-0 transition-opacity duration-200 hover:opacity-15 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#B8934A]"
      />
    </>
  );
}
