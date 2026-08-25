import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getAdminClient } from "@/lib/supabase";

declare module "next-auth" {
  interface User {
    role?: "manager" | "staff";
  }
  interface Session {
    isAdmin?: boolean;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: "manager" | "staff";
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ExtendedToken {
  isAdmin?: boolean;
  role?: "manager" | "staff";
  userId?: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.toLowerCase().trim();
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const db = getAdminClient();
        const { data: user, error } = await db
          .from("admin_users")
          .select("id, email, password_hash, name, role")
          .eq("email", email)
          .single();

        if (error || !user) return null;

        const valid = await compare(password, user.password_hash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as "manager" | "staff",
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 60 * 60,  // Re-issue token every hour
  },
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Only allow redirects to same origin /admin paths
      if (url.startsWith("/admin")) return url;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/admin/dashboard`;
    },
    async jwt({ token, user }) {
      if (user) {
        (token as Record<string, unknown>).isAdmin = true;
        (token as Record<string, unknown>).role = user.role;
        (token as Record<string, unknown>).userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as Record<string, unknown>;
      if (t.isAdmin) (session as { isAdmin?: boolean }).isAdmin = true;
      if (t.role) session.user.role = t.role as "manager" | "staff";
      if (t.userId) session.user.id = t.userId as string;
      return session;
    },
  },
  trustHost: true,
});
