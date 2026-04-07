import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import crypto from "crypto";
import {
  USERS_TABLE,
  base,
  cachedFirstPage,
  invalidateTable,
  noteCall,
} from "@/lib/airtable";

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
      const email = String(user?.email ?? "")
        .toLowerCase()
        .trim();
      if (!email) return false;

      const existing = await cachedFirstPage(
        USERS_TABLE,
        { maxRecords: 1, filterByFormula: `{email} = "${email}"` },
        60,
      );

      if (!existing || existing.length === 0) {
        const userId = crypto.randomUUID();
        noteCall(USERS_TABLE);
        await base(USERS_TABLE).create([
          { fields: { userId, email, role: "leader" } },
        ]);

        try {
          invalidateTable(USERS_TABLE);
        } catch (e) {
          console.warn("Failed to invalidate users cache", e);
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      const email = String(token.email ?? user?.email ?? "")
        .toLowerCase()
        .trim();
      if (!email) return token;

      const existing = await cachedFirstPage(
        USERS_TABLE,
        { maxRecords: 1, filterByFormula: `{email} = "${email}"` },
        60,
      );

      const record = existing?.[0];
      const fields = (record?.fields ?? {}) as Record<string, unknown>;
      const userId =
        String(fields.userId ?? fields.userID ?? fields.userid ?? "").trim() ||
        undefined;
      const role = String(fields.role ?? "").trim() || "leader";

      (token as any).userId = userId;
      (token as any).role = role;
      return token;
    },
    async session({ session, token }) {
      (session as any).userId = (token as any).userId;
      (session as any).role = (token as any).role ?? "leader";
      return session;
    },
  },
};
