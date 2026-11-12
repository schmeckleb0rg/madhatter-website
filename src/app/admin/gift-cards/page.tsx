export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { GiftCard } from "@/lib/supabase";
import GiftCardsAdmin from "@/components/admin/GiftCardsAdmin";
import PageVisibilityToggle from "@/components/admin/PageVisibilityToggle";

async function getGiftCards(): Promise<GiftCard[]> {
  const db = getAdminClient();
  const { data } = await db.from("gift_cards").select("*").order("created_at", { ascending: false });
  return (data as GiftCard[]) ?? [];
}

export default async function AdminGiftCardsPage() {
  const cards = await getGiftCards();
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <PageVisibilityToggle pageKey="gift_cards" label="Gift Cards" />
      </div>
      <GiftCardsAdmin initialCards={cards} />
    </>
  );
}
