import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/security";
import { sendWelcomeEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email().max(200),
});

export async function POST(request: Request) {
  // Rate limit
  const ip = getClientIp(request);
  const { allowed } = rateLimit(ip, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const db = getAdminClient();

  // Check for duplicate
  const { data: existing } = await db
    .from("subscribers")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    // Already subscribed — return success silently
    return NextResponse.json({ success: true }, { status: 200 });
  }

  // Insert subscriber
  const { error } = await db.from("subscribers").insert({ email });

  if (error) {
    console.error("Subscriber insert error:", error);
    return NextResponse.json({ error: "Failed to subscribe." }, { status: 500 });
  }

  // Send welcome email using template from email_templates table
  const { data: template } = await db
    .from("email_templates")
    .select("subject, body")
    .eq("template_key", "welcome")
    .single();

  if (template) {
    sendWelcomeEmail({
      email,
      subject: template.subject,
      body: template.body,
    });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
