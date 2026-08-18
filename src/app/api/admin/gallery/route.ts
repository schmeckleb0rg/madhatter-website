import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET() {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getAdminClient();
  const { data } = await db.from("gallery_images").select("*").order("sort_order", { ascending: true });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try { formData = await request.formData(); } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string) ?? "";

  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `gallery-${Date.now()}.${ext}`;

  const bytes = await file.arrayBuffer();
  const db = getAdminClient();

  // Ensure bucket exists
  const { data: buckets } = await db.storage.listBuckets();
  if (!buckets?.find((b) => b.name === "gallery")) {
    await db.storage.createBucket("gallery", { public: true });
  }

  const { error: uploadError } = await db.storage
    .from("gallery")
    .upload(filename, bytes, { contentType: file.type, upsert: true });

  if (uploadError) return NextResponse.json({ error: "Upload failed: " + uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = db.storage.from("gallery").getPublicUrl(filename);

  // Get next sort order
  const { data: existing } = await db.from("gallery_images").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const nextOrder = existing && existing.length > 0 ? (existing[0].sort_order ?? 0) + 1 : 0;

  const { data, error } = await db.from("gallery_images").insert({
    image_url: publicUrl,
    caption: caption || null,
    sort_order: nextOrder,
  }).select().single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });

  revalidatePath("/press");
  return NextResponse.json(data, { status: 201 });
}
