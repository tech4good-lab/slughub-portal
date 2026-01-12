import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { base, USERS_TABLE } from "@/lib/airtable";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const records = await base(USERS_TABLE)
          .select({
            maxRecords: 1,
            filterByFormula: `{email} = "${email}"`,
          })
          .firstPage();

        if (records.length === 0) return null;

        const fields = records[0].fields as any;
        const ok = await bcrypt.compare(password, fields.passwordHash);
        if (!ok) return null;

        return { id: fields.userId, email: fields.email, role: fields.role ?? "leader" };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id;
        token.role = (user as any).role ?? "leader";
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).userId = token.userId;
      (session as any).role = token.role;
      return session;
    },
  },
}
