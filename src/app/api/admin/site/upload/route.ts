import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

const ALLOWED_TYPES = [
  "image/png", "image/jpeg", "image/svg+xml",
  "image/webp", "image/gif", "image/x-icon",
  "image/vnd.microsoft.icon",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try { formData = await request.formData(); } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;

  if (!file || !type) return NextResponse.json({ error: "Missing file or type" }, { status: 400 });
  if (!["favicon", "background", "mobile_background", "og_image", "app_icon"].includes(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const filename = `${type}-${Date.now()}.${ext}`;

  const bytes = await file.arrayBuffer();
  const db = getAdminClient();

  // Ensure bucket exists
  const { data: buckets } = await db.storage.listBuckets();
  if (!buckets?.find((b) => b.name === "site-assets")) {
    await db.storage.createBucket("site-assets", { public: true });
  }

  const { error: uploadError } = await db.storage
    .from("site-assets")
    .upload(filename, bytes, { contentType: file.type, upsert: true });

  if (uploadError) return NextResponse.json({ error: "Upload failed: " + uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = db.storage.from("site-assets").getPublicUrl(filename);

  const settingKey = type === "favicon" ? "favicon_url" : type === "og_image" ? "og_image_url" : type === "app_icon" ? "app_icon_url" : type === "mobile_background" ? "mobile_background_url" : "background_url";
  await db.from("site_settings").upsert({
    key: settingKey,
    value: publicUrl,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/");
  revalidatePath("/admin/site");

  return NextResponse.json({ url: publicUrl });
}
