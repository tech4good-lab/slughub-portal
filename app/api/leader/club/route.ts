import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { base, CLUBS_TABLE } from "@/lib/airtable";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const records = await base(CLUBS_TABLE)
    .select({ maxRecords: 1, filterByFormula: `{ownerUserId} = "${userId}"` })
    .firstPage();

  return NextResponse.json({ club: records[0]?.fields ?? null });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const payload = {
    ownerUserId: userId, // enforced server-side
    name: String(body.name ?? "").trim(),
    description: String(body.description ?? "").trim(),
    contactName: String(body.contactName ?? "").trim(),
    contactEmail: String(body.contactEmail ?? "").trim(),
    calendarUrl: String(body.calendarUrl ?? "").trim(),
    discordUrl: String(body.discordUrl ?? "").trim(),
    websiteUrl: String(body.websiteUrl ?? "").trim(),
    instagramUrl: String(body.instagramUrl ?? "").trim(),
    linkedinUrl: String(body.linkedinUrl ?? "").trim(),
    updatedAt: new Date().toISOString(),
  };

  if (!payload.name) {
    return NextResponse.json({ error: "Club name is required." }, { status: 400 });
  }

  // Find existing club for this leader
  const existing = await base(CLUBS_TABLE)
    .select({ maxRecords: 1, filterByFormula: `{ownerUserId} = "${userId}"` })
    .firstPage();

  if (existing.length === 0) {
    const clubId = crypto.randomUUID();
    const created = await base(CLUBS_TABLE).create([{ fields: { clubId, ...payload } }]);
    return NextResponse.json({ club: created[0].fields });
  } else {
    const recId = existing[0].id;
    const updated = await base(CLUBS_TABLE).update([{ id: recId, fields: payload }]);
    return NextResponse.json({ club: updated[0].fields });
  }
}
