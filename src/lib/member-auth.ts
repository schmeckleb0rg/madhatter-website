import { SignJWT, jwtVerify } from "jose";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";

const COOKIE_NAME = "mh-member-session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.MEMBER_JWT_SECRET || process.env.NEXTAUTH_SECRET || "member-secret-change-me"
);

export type MemberSession = {
  memberId: string;
  email: string;
  name: string;
  tier: string;
};

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export async function createMemberSession(payload: MemberSession): Promise<string> {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return token;
}

export async function getMemberSession(): Promise<MemberSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      memberId: payload.memberId as string,
      email: payload.email as string,
      name: payload.name as string,
      tier: payload.tier as string,
    };
  } catch {
    return null;
  }
}

export async function clearMemberSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireMember(): Promise<MemberSession> {
  const session = await getMemberSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
