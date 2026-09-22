import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      id: "dev-login",
      name: "Simulated Dev Login",
      credentials: {
        role: { label: "Role", type: "text" },
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials) {
        const role = credentials?.role === "leader" ? "leader" : "admin";
        const email = (
          credentials?.email ||
          (role === "admin" ? "superkaush@gmail.com" : "leader@ucsc.edu")
        )
          .toLowerCase()
          .trim();
        const name = role === "admin" ? "Admin (Dev Test)" : "Leader (Dev Test)";

        try {
          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name,
                role,
              },
            });
          } else if (user.role !== role) {
            user = await prisma.user.update({
              where: { email },
              data: { role },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? name,
            role: user.role,
          };
        } catch (e) {
          console.warn("Dev login DB warning, falling back to simulated session:", e);
          return {
            id: "dev-" + role + "-id",
            email,
            name,
            role,
          };
        }
      },
    }),
  ],
  debug: true,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "dev-login" || account?.provider === "credentials") {
        return true;
      }
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
      console.log("signIn user object:", user); // check if user.name exists
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
        (session as any).userName = token.name;
        (session.user as any).id = token.userId;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
