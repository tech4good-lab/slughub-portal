import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { base, CLUBS_TABLE, CLUB_MEMBERS_TABLE } from "@/lib/airtable";

async function isLeaderForClub(userId: string, clubId: string) {
  const memberRows = await base(CLUB_MEMBERS_TABLE)
    .select({
      maxRecords: 1,
      filterByFormula: `AND({clubId} = "${clubId}", {userId} = "${userId}")`,
    })
    .firstPage();

  if (memberRows.length === 0) return false;

  const role = (memberRows[0].fields as any)?.memberRole;
  return role === "leader" || role === "admin";
}

async function getClubRecordByClubId(clubId: string) {
  const clubs = await base(CLUBS_TABLE)
    .select({
      maxRecords: 1,
      filterByFormula: `{clubId} = "${clubId}"`,
    })
    .firstPage();

  return clubs[0] ?? null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "leader" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clubId } = await params;

  const ok = await isLeaderForClub(userId, clubId);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clubRec = await getClubRecordByClubId(clubId);
  if (!clubRec) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ club: { recordId: clubRec.id, ...clubRec.fields } });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "leader" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clubId } = await params;

  const ok = await isLeaderForClub(userId, clubId);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clubRec = await getClubRecordByClubId(clubId);
  if (!clubRec) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const payload: any = {
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

  const existingStatus = (clubRec.fields as any)?.status ?? "approved";

  // Leaders: always go back to pending when they edit
  // Admins: keep status as-is (or approved)
  const nextStatus = role === "admin" ? existingStatus : "pending";

  const nowIso = new Date().toISOString();
  payload.status = nextStatus;

  if (nextStatus === "pending") {
    payload.submittedAt = nowIso;
    payload.reviewedAt = null;     // IMPORTANT: null not ""
    payload.reviewNotes = "";      // reset notes on resubmission
  }

  const updated = await base(CLUBS_TABLE).update([
    { id: clubRec.id, fields: payload },
  ]);

  return NextResponse.json({ club: { recordId: updated[0].id, ...updated[0].fields } });
}
