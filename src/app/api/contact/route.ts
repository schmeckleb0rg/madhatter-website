import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(2000),
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
    return NextResponse.json({ error: "Please fill out all required fields." }, { status: 400 });
  }

  const d = parsed.data;
  const db = getAdminClient();
  const { error } = await db.from("contact_messages").insert({
    name: sanitizeText(d.name),
    email: sanitizeText(d.email),
    subject: d.subject ? sanitizeText(d.subject) : null,
    message: sanitizeText(d.message),
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
