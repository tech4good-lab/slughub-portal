import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  ACCESS_REQUESTS_TABLE,
  base,
  CLUBS_TABLE,
  CLUB_MEMBERS_TABLE,
  EVENTS_TABLE,
  cachedAll,
  invalidateTable,
  noteCall,
} from "@/lib/airtable";

async function isLeaderForClub(userId: string, clubId: string) {
  const memberRows = await cachedAll(
    CLUB_MEMBERS_TABLE,
    { filterByFormula: `{userId} = "${userId}"` },
    300
  );

  const match = (memberRows || []).find(
    (r: any) => String((r.fields as any)?.clubId ?? "") === clubId
  );
  if (!match) return false;

  const role = (match.fields as any)?.memberRole;
  return role === "leader" || role === "admin";
}

async function getClubRecordByClubId(clubId: string) {
  const clubs = await cachedAll(
    CLUBS_TABLE,
    { sort: [{ field: "updatedAt", direction: "desc" }] },
    600
  );

  const match = (clubs || []).find((r: any) => String((r.fields as any)?.clubId ?? "") === clubId);
  return match ?? null;
}

async function deleteRecordsByClubId(table: string, clubId: string) {
  const rows = await cachedAll(table, { filterByFormula: `{clubId} = "${clubId}"` }, 0);
  const ids = (rows || []).map((r: any) => String(r.id ?? "")).filter(Boolean);
  if (ids.length === 0) return 0;

  let deleted = 0;
  for (let i = 0; i < ids.length; i += 10) {
    const batch = ids.slice(i, i + 10);
    noteCall(table);
    await base(table).destroy(batch);
    deleted += batch.length;
  }
  return deleted;
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

  const f = clubRec.fields as any;
  return NextResponse.json({ club: { recordId: clubRec.id, ...f, category: f.Category ?? f.category } });
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
    clubIcebreakers: String(body.clubIcebreakers ?? "").trim(),
    contactName: String(body.contactName ?? "").trim(),
    contactEmail: String(body.contactEmail ?? "").trim(),
    category: String(body.category ?? "").trim(),
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

  // Any edit should go back to pending for approval.
  const nextStatus = "pending";

  const nowIso = new Date().toISOString();
  payload.status = nextStatus;

  if (nextStatus === "pending") {
    payload.submittedAt = nowIso;
    payload.reviewedAt = null;     // IMPORTANT: null not ""
    payload.reviewNotes = "";      // reset notes on resubmission
  }

  noteCall(CLUBS_TABLE);
  let updated: any;
  try {
    updated = await base(CLUBS_TABLE).update([{ id: clubRec.id, fields: payload }]);
  } catch (err: any) {
    const msg = String(err?.message ?? "");
    if (msg.includes("Unknown field") || msg.includes("Unknown field name")) {
      const fallback = { ...payload };
      delete (fallback as any).category;
      delete (fallback as any).clubIcebreakers;
      updated = await base(CLUBS_TABLE).update([{ id: clubRec.id, fields: fallback }]);
    } else {
      throw err;
    }
  }

  try {
    invalidateTable(CLUBS_TABLE);
  } catch (e) {
    console.warn("Failed to invalidate clubs cache after leader update", e);
  }
  try {
    revalidatePath("/leader/dashboard");
  } catch (e) {
    console.warn("Failed to revalidate leader dashboard", e);
  }

  const updatedFields = updated[0].fields as any;
  return NextResponse.json({
    club: { recordId: updated[0].id, ...updatedFields, category: updatedFields.Category ?? updatedFields.category },
  });
}

export async function DELETE(
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

  const deletedEvents = await deleteRecordsByClubId(EVENTS_TABLE, clubId);
  const deletedMembers = await deleteRecordsByClubId(CLUB_MEMBERS_TABLE, clubId);
  const deletedAccessRequests = await deleteRecordsByClubId(ACCESS_REQUESTS_TABLE, clubId);

  noteCall(CLUBS_TABLE);
  await base(CLUBS_TABLE).destroy([clubRec.id]);

  try {
    invalidateTable(CLUBS_TABLE);
    invalidateTable(CLUB_MEMBERS_TABLE);
    invalidateTable(EVENTS_TABLE);
    invalidateTable(ACCESS_REQUESTS_TABLE);
  } catch (e) {
    console.warn("Failed to invalidate cache after club deletion", e);
  }
  try {
    revalidatePath("/leader/dashboard");
    revalidatePath("/directory");
    revalidatePath(`/clubs/${clubId}`);
  } catch (e) {
    console.warn("Failed to revalidate paths after club deletion", e);
  }

  return NextResponse.json({
    ok: true,
    deleted: {
      club: 1,
      events: deletedEvents,
      members: deletedMembers,
      accessRequests: deletedAccessRequests,
    },
  });
}
