import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { base, CLUBS_TABLE, cachedAll, invalidateTable, noteCall } from "@/lib/airtable";
import { getUserClubIds } from "@/lib/permissions";

const MEMBERS_TABLE = process.env.AIRTABLE_MEMBERS_TABLE || "ClubMembers";

function orFormulaForClubIds(clubIds: string[]) {
  // OR({clubId}="a",{clubId}="b",...)
  const parts = clubIds.map((id) => `{clubId}="${id}"`);
  return `OR(${parts.join(",")})`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "leader" && role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clubIds = await getUserClubIds(userId);
  if (clubIds.length === 0) return NextResponse.json({ clubs: [] });

  const records = await cachedAll(
    CLUBS_TABLE,
    { filterByFormula: orFormulaForClubIds(clubIds), sort: [{ field: "updatedAt", direction: "desc" }] },
    20
  );

  const clubs = (records || []).map((r: any) => ({ recordId: r.id, ...r.fields }));
  return NextResponse.json({ clubs });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session as any)?.userId;
    const role = (session as any)?.role;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (role !== "leader" && role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const nowIso = new Date().toISOString();

    const clubId = crypto.randomUUID();

    const payload = {
      clubId,
      name: String(body.name ?? "").trim(),
      description: String(body.description ?? "").trim(),
      contactName: String(body.contactName ?? "").trim(),
      contactEmail: String(body.contactEmail ?? "").trim(),
      calendarUrl: String(body.calendarUrl ?? "").trim(),
      discordUrl: String(body.discordUrl ?? "").trim(),
      websiteUrl: String(body.websiteUrl ?? "").trim(),
      instagramUrl: String(body.instagramUrl ?? "").trim(),
      linkedinUrl: String(body.linkedinUrl ?? "").trim(),
      updatedAt: nowIso,

      status: "pending",
      submittedAt: nowIso,
      reviewNotes: "",
    };

    if (!payload.name) {
      return NextResponse.json({ error: "Club name is required." }, { status: 400 });
    }

    noteCall(CLUBS_TABLE);
    const created = await base(CLUBS_TABLE).create([{ fields: payload }]);

    // Add membership so creator can manage this club
    noteCall(MEMBERS_TABLE);
    await base(MEMBERS_TABLE).create([
      {
        fields: {
          clubId,
          userId,
          memberRole: "leader",
          createdAt: nowIso,
        },
      },
    ]);

    try {
      invalidateTable(CLUBS_TABLE);
      invalidateTable(MEMBERS_TABLE);
    } catch (e) {
      console.warn("Failed to invalidate leader clubs cache", e);
    }

    return NextResponse.json({ club: { recordId: created[0].id, ...created[0].fields } });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
