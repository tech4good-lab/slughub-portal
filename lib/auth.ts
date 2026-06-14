import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  debug: true,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const email = user.email.toLowerCase().trim();

      const existing = await prisma.user.findUnique({ where: { email } });

      if (!existing) {
        await prisma.user.create({
          data: {
            email,
            name: user.name ?? null,  // ← save Google name
            role: "leader",
          },
        });
      } else if (user.name && !existing.name) {
        // backfill name for existing users who signed in before this change
        await prisma.user.update({
          where: { email },
          data: { name: user.name },
        });
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as any).role;
        token.name = user.name;  // ← add this
      }

      if (!token.role || !token.userId) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
        });
        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;  // ← add this
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session as any).userId = token.userId;
        (session as any).role = token.role;
        (session as any).userName = token.name;  // ← add this
      }
      return session;
    },
  },
};
