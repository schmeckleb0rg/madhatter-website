import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { rateLimit, sanitizeText, getClientIp } from "@/lib/security";
import { notifyTicketInquiry } from "@/lib/email";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  phone: z.string().max(20).optional(),
  event_id: z.string().uuid().optional().or(z.literal("")),
  party_size: z.coerce.number().int().min(1).max(20).default(1),
  message: z.string().max(1000).optional(),
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
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data." }, { status: 400 });
  }

  const data = parsed.data;

  const { error } = await supabase.from("ticket_inquiries").insert({
    name: sanitizeText(data.name),
    email: data.email.toLowerCase().trim(),
    phone: data.phone ? sanitizeText(data.phone) : null,
    event_id: data.event_id || null,
    party_size: data.party_size,
    message: data.message ? sanitizeText(data.message) : null,
  });

  if (error) {
    console.error("Inquiry insert error:", error);
    return NextResponse.json({ error: "Failed to submit." }, { status: 500 });
  }

  // Resolve event title for email notification
  let eventTitle: string | null = null;
  if (data.event_id) {
    const { data: event } = await supabase.from("events").select("title").eq("id", data.event_id).single();
    eventTitle = event?.title ?? null;
  }

  // Send email notification (non-blocking)
  notifyTicketInquiry({
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    partySize: data.party_size,
    eventTitle,
    message: data.message ?? null,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
