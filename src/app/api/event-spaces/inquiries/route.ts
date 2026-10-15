import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";

const schema = z.object({
  type: z.enum(["corporate", "podcast"]),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(30).optional(),
  company: z.string().max(200).optional(),
  attendees: z.string().max(50).optional(),
  date: z.string().max(50).optional(),
  budget: z.string().max(100).optional(),
  avNeeds: z.string().max(500).optional(),
  catering: z.string().max(500).optional(),
  podcastName: z.string().max(200).optional(),
  duration: z.string().max(50).optional(),
  equipmentNeeds: z.string().max(500).optional(),
  liveAudience: z.boolean().optional(),
  message: z.string().max(2000).optional(),
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

  const d = parsed.data;
  const db = getAdminClient();

  // Store as a private event inquiry with the type info in the message
  const details = Object.entries(d)
    .filter(([key, val]) => val && key !== "name" && key !== "email" && key !== "phone")
    .map(([key, val]) => `${key}: ${val}`)
    .join("\n");

  const { error } = await db.from("private_event_inquiries").insert({
    name: sanitizeText(d.name),
    email: sanitizeText(d.email),
    phone: d.phone ? sanitizeText(d.phone) : null,
    event_type: d.type === "corporate" ? "Corporate Event" : "Podcast Studio",
    message: sanitizeText(details),
    guest_count: d.attendees ? parseInt(d.attendees) || null : null,
    preferred_date: d.date || null,
  });

  if (error) {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
