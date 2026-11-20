import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

const postSchema = z.object({
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
});

const putSchema = z.discriminatedUnion("action", [
  z.object({
    id: z.string().uuid(),
    action: z.literal("send"),
  }),
  z.object({
    id: z.string().uuid(),
    action: z.literal("edit"),
    subject: z.string().min(1).max(500),
    body: z.string().min(1).max(10000),
    scheduled_for: z.string().nullable().optional(),
  }),
  z.object({
    id: z.string().uuid(),
    action: z.literal("schedule"),
    scheduled_for: z.string().min(1),
  }),
]);

export async function GET(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getAdminClient();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const id = searchParams.get("id");

  // Single item with recipients + tracking
  if (id) {
    const { data: item } = await db.from("email_queue").select("*").eq("id", id).single();
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [{ data: recipients }, { data: tracking }] = await Promise.all([
      db.from("email_recipients").select("*").eq("queue_id", id).order("sent_at", { ascending: false }),
      db.from("email_tracking").select("*").eq("queue_id", id).order("created_at", { ascending: false }),
    ]);

    return NextResponse.json({ ...item, recipients: recipients ?? [], tracking: tracking ?? [] });
  }

  // Filtered list
  let query = db.from("email_queue").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { subject, body: emailBody } = parsed.data;
  const db = getAdminClient();

  const { data, error } = await db.from("email_queue").insert({
    subject: sanitizeText(subject),
    body: sanitizeText(emailBody),
    status: "draft",
  }).select().single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });

  revalidatePath("/admin/messaging");
  revalidatePath("/admin/dashboard");
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = putSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { id, action } = parsed.data;
  const db = getAdminClient();

  // Edit a draft
  if (action === "edit") {
    const { subject, body: emailBody, scheduled_for } = parsed.data;
    const update: Record<string, unknown> = {
      subject: sanitizeText(subject),
      body: sanitizeText(emailBody),
    };
    if (scheduled_for !== undefined) {
      update.scheduled_for = scheduled_for;
    }
    const { data, error } = await db.from("email_queue").update(update)
      .eq("id", id).eq("status", "draft").select().single();
    if (error || !data) return NextResponse.json({ error: "Draft not found or update failed" }, { status: 404 });
    revalidatePath("/admin/messaging");
    return NextResponse.json(data);
  }

  // Schedule a draft
  if (action === "schedule") {
    const { scheduled_for } = parsed.data;
    const { data, error } = await db.from("email_queue").update({
      scheduled_for,
      status: "draft",
    }).eq("id", id).eq("status", "draft").select().single();
    if (error || !data) return NextResponse.json({ error: "Draft not found or schedule failed" }, { status: 404 });
    revalidatePath("/admin/messaging");
    return NextResponse.json(data);
  }

  // Send a draft
  const { data: queueItem } = await db.from("email_queue").select("*").eq("id", id).eq("status", "draft").single();
  if (!queueItem) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

  // Get all active subscribers
  const { data: subscribers } = await db.from("subscribers").select("email").eq("is_active", true);
  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ error: "No active subscribers" }, { status: 400 });
  }

  // Send via Resend if configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const emails = subscribers.map((s) => s.email);
      const fromEmail = process.env.RESEND_FROM_EMAIL ?? "MadHatter Comedy <noreply@madhattercomedy.com>";

      // Send in batches of 50 using BCC to protect subscriber privacy
      const batchSize = 50;
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: fromEmail,
            bcc: batch,
            subject: queueItem.subject,
            html: queueItem.body,
          }),
        });

        if (!res.ok) {
          await db.from("email_queue").update({ status: "failed" }).eq("id", id);
          return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
        }
      }

    } catch {
      await db.from("email_queue").update({ status: "failed" }).eq("id", id);
      return NextResponse.json({ error: "Email sending error" }, { status: 500 });
    }
  }

  // Mark as sent and record recipient count
  await db.from("email_queue").update({
    status: "sent",
    sent_at: new Date().toISOString(),
    scheduled_for: null,
    recipient_count: subscribers.length,
  }).eq("id", id);

  // Record individual recipients
  const recipientRows = subscribers.map((s) => ({
    queue_id: id,
    email: s.email,
  }));
  await db.from("email_recipients").insert(recipientRows);

  revalidatePath("/admin/messaging");
  revalidatePath("/admin/dashboard");
  return NextResponse.json({ success: true, recipientCount: subscribers.length });
}

export async function DELETE(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = getAdminClient();
  const { error } = await db.from("email_queue").delete().eq("id", id).eq("status", "draft");
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });

  revalidatePath("/admin/messaging");
  revalidatePath("/admin/dashboard");
  return NextResponse.json({ success: true });
}
