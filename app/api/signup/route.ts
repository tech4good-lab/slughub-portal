import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { base, USERS_TABLE, cachedFirstPage, invalidateTable, noteCall } from "@/lib/airtable";

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

  const existing = await cachedFirstPage(USERS_TABLE, { maxRecords: 1, filterByFormula: `{email} = "${e}"` }, 10);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Email already exists." }, { status: 409 });
  }

  const userId = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(p, 10);

  noteCall(USERS_TABLE);
  await base(USERS_TABLE).create([{ fields: { userId, email: e, passwordHash } }]);

  try {
    invalidateTable(USERS_TABLE);
  } catch (e) {
    console.warn("Failed to invalidate users cache", e);
  }

  return NextResponse.json({ ok: true });
}
