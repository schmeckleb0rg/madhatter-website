import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const db = getAdminClient();

  const [cardRes, txRes] = await Promise.all([
    db.from("gift_cards").select("*").eq("id", id).single(),
    db.from("gift_card_transactions").select("*").eq("gift_card_id", id).order("created_at", { ascending: false }),
  ]);

  if (!cardRes.data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...cardRes.data,
    transactions: txRes.data ?? [],
  });
}

const updateSchema = z.object({
  is_voided: z.boolean().optional(),
  expires_at: z.string().optional(),
  balance_cents: z.number().int().min(0).optional(),
});

export async function PUT(request: Request, context: RouteContext) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const db = getAdminClient();
  const updates: Record<string, unknown> = {};

  if (parsed.data.is_voided !== undefined) {
    updates.is_voided = parsed.data.is_voided;
    if (parsed.data.is_voided) {
      // Record void transaction
      const { data: card } = await db.from("gift_cards").select("balance_cents").eq("id", id).single();
      if (card && card.balance_cents > 0) {
        await db.from("gift_card_transactions").insert({
          gift_card_id: id,
          amount_cents: card.balance_cents,
          type: "void",
        });
        updates.balance_cents = 0;
      }
    }
  }

  if (parsed.data.expires_at !== undefined) {
    updates.expires_at = parsed.data.expires_at;
  }

  if (parsed.data.balance_cents !== undefined) {
    updates.balance_cents = parsed.data.balance_cents;
  }

  const { error } = await db.from("gift_cards").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  revalidatePath("/admin/gift-cards");
  return NextResponse.json({ success: true });
}
