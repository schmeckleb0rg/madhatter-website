import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

function generateGiftCardCode(): string {
  const bytes = randomBytes(6);
  const code = bytes.toString("hex").toUpperCase().slice(0, 12);
  return `MH-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
}

export async function GET(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const db = getAdminClient();
  let query = db.from("gift_cards").select("*").order("created_at", { ascending: false });

  if (search) {
    query = query.or(`code.ilike.%${search}%,recipient_email.ilike.%${search}%,issued_to_email.ilike.%${search}%`);
  }

  if (status === "active") query = query.eq("is_active", true).eq("is_voided", false);
  else if (status === "voided") query = query.eq("is_voided", true);
  else if (status === "pending") query = query.eq("is_active", false).eq("is_voided", false);

  const { data } = await query;
  return NextResponse.json(data ?? []);
}

const manualSchema = z.object({
  amount_cents: z.number().int().min(100).max(50000),
  recipient_email: z.string().email().max(200),
  recipient_name: z.string().max(100).optional(),
  issued_by_name: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
  expiry_days: z.number().int().min(1).max(3650).optional(),
});

export async function POST(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = manualSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const d = parsed.data;
  const db = getAdminClient();

  const { data: expirySetting } = await db
    .from("site_settings")
    .select("value")
    .eq("key", "gift_card_expiry_days")
    .single();
  const expiryDays = d.expiry_days ?? parseInt(expirySetting?.value ?? "365", 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  const code = generateGiftCardCode();

  const { data, error } = await db.from("gift_cards").insert({
    code,
    balance_cents: d.amount_cents,
    original_amount_cents: d.amount_cents,
    redeemed_amount_cents: 0,
    issued_to_email: sanitizeText(d.recipient_email),
    issued_by_name: d.issued_by_name ? sanitizeText(d.issued_by_name) : "Box Office",
    recipient_name: d.recipient_name ? sanitizeText(d.recipient_name) : null,
    recipient_email: sanitizeText(d.recipient_email),
    message: d.message ? sanitizeText(d.message) : null,
    expires_at: expiresAt.toISOString(),
    is_voided: false,
    is_active: true, // Manual cards are immediately active
  }).select().single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });

  // Record purchase transaction
  await db.from("gift_card_transactions").insert({
    gift_card_id: data.id,
    amount_cents: d.amount_cents,
    type: "purchase",
  });

  revalidatePath("/admin/gift-cards");
  return NextResponse.json(data, { status: 201 });
}
