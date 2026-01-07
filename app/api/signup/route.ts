import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { base, USERS_TABLE } from "@/lib/airtable";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const e = String(email ?? "").toLowerCase().trim();
  const p = String(password ?? "");

  if (!e || !p || p.length < 8) {
    return NextResponse.json(
      { error: "Use a valid email and password (8+ chars)." },
      { status: 400 }
    );
  }

  const existing = await base(USERS_TABLE)
    .select({ maxRecords: 1, filterByFormula: `{email} = "${e}"` })
    .firstPage();

  if (existing.length > 0) {
    return NextResponse.json({ error: "Email already exists." }, { status: 409 });
  }

  const userId = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(p, 10);

  await base(USERS_TABLE).create([{ fields: { userId, email: e, passwordHash } }]);

  return NextResponse.json({ ok: true });
}
