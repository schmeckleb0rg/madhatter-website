import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { sendPasswordResetEmail } from "@/lib/email";
import { createHash, randomUUID } from "crypto";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(200),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const db = getAdminClient();

  // Always return success to prevent email enumeration
  const successResponse = NextResponse.json({
    message: "If an account exists with that email, you will receive a password reset link.",
  });

  const { data: user } = await db
    .from("admin_users")
    .select("id, email")
    .eq("email", email)
    .single();

  if (!user) return successResponse;

  // Invalidate any existing unused tokens for this user
  await db
    .from("password_reset_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("used_at", null);

  // Generate token and hash it for storage
  const rawToken = randomUUID();
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  const { error } = await db.from("password_reset_tokens").insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (error) {
    console.error("Failed to create password reset token:", error);
    return successResponse;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetUrl = `${siteUrl}/admin/reset-password?token=${rawToken}`;

  await sendPasswordResetEmail({ email: user.email, resetUrl });

  return successResponse;
}
