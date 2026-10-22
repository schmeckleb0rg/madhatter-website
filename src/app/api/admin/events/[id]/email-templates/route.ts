import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";

const TEMPLATE_TYPES = ["confirmation", "cancellation", "event_cancellation", "reminder"] as const;

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getAdminClient();

  const { data: templates } = await db
    .from("event_email_templates")
    .select("*")
    .eq("event_id", id);

  // Return all 4 types, filling in empty defaults for missing ones
  const result = TEMPLATE_TYPES.map((type) => {
    const existing = (templates ?? []).find((t) => t.template_type === type);
    return existing ?? { template_type: type, subject: "", body: "" };
  });

  return NextResponse.json(result);
}

const templateSchema = z.object({
  template_type: z.enum(TEMPLATE_TYPES),
  subject: z.string().max(500),
  body: z.string().max(10000),
});

const putSchema = z.object({
  templates: z.array(templateSchema),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = putSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const db = getAdminClient();

  // Upsert each template
  for (const t of parsed.data.templates) {
    await db
      .from("event_email_templates")
      .upsert(
        {
          event_id: id,
          template_type: t.template_type,
          subject: t.subject,
          body: t.body,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "event_id,template_type" }
      );
  }

  return NextResponse.json({ success: true });
}
