import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

async function requireAuth() {
  const session = await auth();
  if (!session || !(session as { isAdmin?: boolean }).isAdmin) return null;
  return session;
}

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "video/quicktime": "mov",
  "video/mp4": "mp4",
  // Some browsers report .mov as these types
  "video/mov": "mov",
  "video/x-quicktime": "mov",
};

const MAX_SIZE = 100 * 1024 * 1024; // 100MB (covers .mov files)
const BUCKET = "media";

export async function POST(request: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string | null) ?? "uploads";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 100MB)" }, { status: 400 });

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}. Allowed: PNG, JPEG, GIF, MOV` },
      { status: 400 }
    );
  }

  const safeFolder = folder.replace(/[^a-z0-9-]/g, "-").slice(0, 50);
  const filename = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

  const bytes = await file.arrayBuffer();
  const db = getAdminClient();

  // Ensure bucket exists
  const { data: buckets } = await db.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await db.storage.createBucket(BUCKET, { public: true });
  }

  const { error: uploadError } = await db.storage
    .from(BUCKET)
    .upload(filename, bytes, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed: " + uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(filename);
  return NextResponse.json({ url: publicUrl });
}
