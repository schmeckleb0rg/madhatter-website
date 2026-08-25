import { supabase } from "@/lib/supabase";
import type { MerchItem } from "@/lib/supabase";
import { getVenueInfo } from "@/lib/venue";
import MerchClient from "./MerchClient";

export const revalidate = 60;

export const metadata = {
  title: "Merch | Mad Hatter Comedy Club",
  description: "Official Mad Hatter Comedy Club merchandise. Hats, tees, and more.",
};

async function getMerch(): Promise<MerchItem[]> {
  const { data } = await supabase
    .from("merch_items")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return (data as MerchItem[]) ?? [];
}

async function getPageContent() {
  const { data } = await supabase
    .from("page_content")
    .select("section_key, content")
    .eq("page_key", "merch");
  const content: Record<string, string> = {};
  (data ?? []).forEach((r: { section_key: string; content: string }) => {
    content[r.section_key] = r.content;
  });
  return content;
}

export default async function MerchPage() {
  const [products, venue, content] = await Promise.all([
    getMerch(),
    getVenueInfo(),
    getPageContent(),
  ]);

  return (
    <MerchClient
      products={products}
      merchEmail={venue.merchEmail}
      content={content}
    />
  );
}
