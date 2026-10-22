import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sendEventCancellationEmail } from "@/lib/email";

const schema = z.object({
  message: z.string().min(1).max(5000),
});

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const db = getAdminClient();

  // Fetch event
  const { data: event } = await db
    .from("events")
    .select("id, title, date, is_cancelled")
    .eq("id", id)
    .single();

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.is_cancelled) return NextResponse.json({ error: "Event is already cancelled" }, { status: 400 });

  // Mark event as cancelled
  const { error: updateError } = await db
    .from("events")
    .update({
      is_cancelled: true,
      cancellation_reason: parsed.data.message,
      cancelled_at: new Date().toISOString(),
      is_sold_out: false,
    })
    .eq("id", id);

  if (updateError) return NextResponse.json({ error: "Failed to cancel event" }, { status: 500 });

  // Fetch all completed orders for this event
  const { data: orders } = await db
    .from("orders")
    .select("email, name")
    .eq("event_id", id)
    .eq("status", "completed");

  // Deduplicate by email
  const uniqueEmails = new Map<string, string | null>();
  for (const order of orders ?? []) {
    if (!uniqueEmails.has(order.email)) {
      uniqueEmails.set(order.email, order.name);
    }
  }

  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Send cancellation emails
  let sentCount = 0;
  for (const [email, name] of uniqueEmails) {
    try {
      await sendEventCancellationEmail({
        email,
        name,
        eventTitle: event.title,
        eventDate,
        message: parsed.data.message,
      });
      sentCount++;
    } catch (err) {
      console.error(`Failed to send cancellation email to ${email}:`, err);
    }
  }

  return NextResponse.json({
    success: true,
    emailsSent: sentCount,
    totalRecipients: uniqueEmails.size,
  });
}
