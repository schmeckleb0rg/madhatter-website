export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { GiftCard } from "@/lib/supabase";
import GiftCardsAdmin from "@/components/admin/GiftCardsAdmin";

async function getGiftCards(): Promise<GiftCard[]> {
  const db = getAdminClient();
  const { data } = await db.from("gift_cards").select("*").order("created_at", { ascending: false });
  return (data as GiftCard[]) ?? [];
}

export default async function AdminGiftCardsPage() {
  const cards = await getGiftCards();
  return <GiftCardsAdmin initialCards={cards} />;
}
