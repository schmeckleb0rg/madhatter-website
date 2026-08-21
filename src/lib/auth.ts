import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Password",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const password = credentials?.password as string | undefined;
        const sitePassword = process.env.SITE_PASSWORD;

        if (!password || !sitePassword) return null;

        // Constant-time string comparison to prevent timing attacks
        const encoder = new TextEncoder();
        const a = encoder.encode(password);
        const b = encoder.encode(sitePassword);

        if (a.length !== b.length) return null;

        let mismatch = 0;
        for (let i = 0; i < a.length; i++) {
          mismatch |= a[i] ^ b[i];
        }

        if (mismatch !== 0) return null;

        return { id: "admin", name: "Admin", email: "admin@madhattercomedy.com" };
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
      if (user) token.isAdmin = true;
      return token;
    },
    async session({ session, token }) {
      if (token.isAdmin) (session as { isAdmin?: boolean }).isAdmin = true;
      return session;
    },
  },
  trustHost: true,
});
