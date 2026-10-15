import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";
import { notifyJobApplication } from "@/lib/email";

const schema = z.object({
  listing_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(30).optional().nullable(),
  answers: z.record(z.string().max(2000)).optional(),
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

  const { error } = await db.from("job_applications").insert({
    listing_id: d.listing_id || null,
    name: sanitizeText(d.name),
    email: sanitizeText(d.email),
    phone: d.phone ? sanitizeText(d.phone) : null,
    answers: d.answers || {},
  });

  if (error) {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }

  // Send admin notification email
  let listingTitle = "General Interest";
  if (d.listing_id) {
    const { data: listing } = await db
      .from("job_listings")
      .select("title")
      .eq("id", d.listing_id)
      .single();
    if (listing) listingTitle = listing.title;
  }

  notifyJobApplication({
    name: sanitizeText(d.name),
    email: sanitizeText(d.email),
    phone: d.phone ? sanitizeText(d.phone) : null,
    listingTitle,
  }).catch((err) => {
    console.error("Failed to send job application notification:", err);
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
