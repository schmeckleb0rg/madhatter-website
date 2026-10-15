import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";

const schema = z.object({
  class_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(30).optional().nullable(),
  message: z.string().max(1000).optional().nullable(),
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

  // Check class exists and is accepting enrollments
  const { data: cls } = await db
    .from("classes")
    .select("enrollment_status, max_enrollment, current_enrollment")
    .eq("id", d.class_id)
    .single();

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  if (cls.enrollment_status === "closed") {
    return NextResponse.json({ error: "Enrollment is closed" }, { status: 400 });
  }

  const { error } = await db.from("class_enrollments").insert({
    class_id: d.class_id,
    name: sanitizeText(d.name),
    email: sanitizeText(d.email),
    phone: d.phone ? sanitizeText(d.phone) : null,
    message: d.message ? sanitizeText(d.message) : null,
    status: "pending",
    payment_status: "unpaid",
  });

  if (error) {
    return NextResponse.json({ error: "Enrollment failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
