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

const putSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["send"]),
});

export async function GET() {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getAdminClient();
  const { data, error } = await db.from("email_queue").select("*").order("created_at", { ascending: false });
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

  const { id } = parsed.data;
  const db = getAdminClient();

  // Get the draft email
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
      const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Mad Hatter Comedy <noreply@madhattercomedy.com>";

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

  // Mark as sent
  await db.from("email_queue").update({
    status: "sent",
    sent_at: new Date().toISOString(),
  }).eq("id", id);

  revalidatePath("/admin/messaging");
  revalidatePath("/admin/dashboard");
  return NextResponse.json({ success: true, recipientCount: subscribers.length });
}
