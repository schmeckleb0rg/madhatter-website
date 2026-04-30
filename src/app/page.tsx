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
    <>
      <style>{`
        #coming-soon-bg {
          background-image: url('/madhatter_mobileComingsoon.svg');
        }
        @media (min-width: 640px) {
          #coming-soon-bg {
            background-image: url('${background}');
          }
        }
      `}</style>
      <div
        id="coming-soon-bg"
        style={{
          position: "fixed",
          inset: 0,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#000",
        }}
      />
    </>
  );
}
