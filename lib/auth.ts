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

      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (!existing) {
        // Create the user if they don't exist
        await prisma.user.create({
          data: {
            email,
            role: "leader", // Default role
            // name: user.name, // Optional: sync name from Google
          },
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as any).role;
      }

      if (!token.role || !token.userId) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
        });
        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session as any).userId = token.userId;
        (session as any).role = token.role;
      }
      return session;
    },
  },
};
