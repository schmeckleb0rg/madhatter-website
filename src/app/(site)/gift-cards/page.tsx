import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import GiftCardClient from "@/components/GiftCardClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gift Cards | Mad Hatter Comedy Club",
  description: "Give the gift of laughter. Purchase a Mad Hatter Comedy Club gift card for any occasion.",
};

async function getGiftCardSettings() {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", [
      "gift_card_denominations",
      "gift_card_custom_min",
      "gift_card_custom_max",
    ]);
  const map = Object.fromEntries((data ?? []).map((s) => [s.key, s.value]));

  let denominations = [2500, 5000, 10000, 15000];
  try {
    const parsed = JSON.parse(map.gift_card_denominations ?? "[]");
    if (Array.isArray(parsed) && parsed.length > 0) denominations = parsed;
  } catch { /* use defaults */ }

  return {
    denominations,
    customMin: parseInt(map.gift_card_custom_min ?? "1000", 10),
    customMax: parseInt(map.gift_card_custom_max ?? "50000", 10),
  };
}

export default async function GiftCardsPage() {
  const settings = await getGiftCardSettings();

  return (
    <div className="pt-24 pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
            The Perfect Gift
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-light leading-none tracking-tight">
            <span className="font-display italic text-muted block dark:text-[#7A7264]">Give the Gift</span>
            <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">of Laughter</span>
          </h1>
          <p className="text-muted dark:text-[#7A7264] mt-4 max-w-md mx-auto text-sm leading-relaxed">
            Mad Hatter gift cards can be redeemed for tickets, merch, and more — online or at the box office.
          </p>
        </div>

        <GiftCardClient
          denominations={settings.denominations}
          customMin={settings.customMin}
          customMax={settings.customMax}
        />
      </div>
    </div>
  );
}
