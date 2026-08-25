import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText, rateLimit, getClientIp } from "@/lib/security";
import { notifyPrivateEventInquiry } from "@/lib/email";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  phone: z.string().max(20).optional(),
  company: z.string().max(100).optional(),
  event_type: z.string().min(1).max(50),
  guest_count: z.number().int().min(1).max(500).nullable().optional(),
  preferred_date: z.string().optional(),
  budget_range: z.string().max(50).optional(),
  message: z.string().max(2000).optional(),
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
    return NextResponse.json({ error: "Please fill out all required fields." }, { status: 400 });
  }

  const d = parsed.data;
  const db = getAdminClient();
  const { error } = await db.from("private_event_inquiries").insert({
    name: sanitizeText(d.name),
    email: d.email.toLowerCase().trim(),
    phone: d.phone ? sanitizeText(d.phone) : null,
    company: d.company ? sanitizeText(d.company) : null,
    event_type: sanitizeText(d.event_type),
    guest_count: d.guest_count ?? null,
    preferred_date: d.preferred_date || null,
    budget_range: d.budget_range ? sanitizeText(d.budget_range) : null,
    message: d.message ? sanitizeText(d.message) : null,
  });

  if (error) {
    console.error("Private event inquiry insert error:", error);
    return NextResponse.json({ error: "Failed to submit inquiry." }, { status: 500 });
  }

  // Send email notification (non-blocking)
  notifyPrivateEventInquiry({
    name: d.name,
    email: d.email,
    phone: d.phone ?? null,
    company: d.company ?? null,
    eventType: d.event_type,
    guestCount: d.guest_count ?? null,
    preferredDate: d.preferred_date ?? null,
    budgetRange: d.budget_range ?? null,
    message: d.message ?? null,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
