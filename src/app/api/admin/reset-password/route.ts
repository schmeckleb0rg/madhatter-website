import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { hash } from "bcryptjs";
import { createHash } from "crypto";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const db = getAdminClient();

  // Find valid, unused, non-expired token
  const { data: resetToken } = await db
    .from("password_reset_tokens")
    .select("id, user_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .single();

  if (!resetToken || new Date(resetToken.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 }
    );
  }

  // Hash new password and update user
  const passwordHash = await hash(password, 12);

  const { error: updateError } = await db
    .from("admin_users")
    .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
    .eq("id", resetToken.user_id);

  if (updateError) {
    console.error("Failed to update password:", updateError);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }

  // Mark token as used
  await db
    .from("password_reset_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", resetToken.id);

  return NextResponse.json({ message: "Password has been reset successfully." });
}
