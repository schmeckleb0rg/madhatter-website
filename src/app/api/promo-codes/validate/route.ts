import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1).max(50),
  event_id: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { code, event_id } = parsed.data;
  const db = getAdminClient();

  const { data: promo } = await db
    .from("promo_codes")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .eq("is_active", true)
    .single();

  if (!promo) {
    return NextResponse.json({ error: "Invalid promo code." }, { status: 404 });
  }

  // Check expiration
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ error: "This promo code has expired." }, { status: 410 });
  }

  // Check usage limits
  if (promo.max_uses && promo.current_uses >= promo.max_uses) {
    return NextResponse.json({ error: "This promo code has reached its usage limit." }, { status: 410 });
  }

  // Check event scope
  if (!promo.is_site_wide && promo.event_id && event_id && promo.event_id !== event_id) {
    return NextResponse.json({ error: "This promo code is not valid for this event." }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    discount_type: promo.discount_type,
    discount_value: Number(promo.discount_value),
    description: promo.description,
  });
}
