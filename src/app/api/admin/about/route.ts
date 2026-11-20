import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";
import { sanitizeText } from "@/lib/security";

const schema = z.object({
  id: z.string().uuid(),
  title: z.string().max(200).optional(),
  content: z.string().max(5000).optional(),
  image_url: z.string().max(2000).optional().nullable(),
});

export async function PUT(request: Request) {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { id, title, content, image_url } = parsed.data;
  const db = getAdminClient();
  const { data, error } = await db
    .from("about_content")
    .update({
      title: title ? sanitizeText(title) : null,
      content: content ? sanitizeText(content) : null,
      image_url: image_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json(data);
}
