import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { base, invalidateTable, noteCall, cachedFind, cachedFirstPage } from "@/lib/airtable";

const REQUESTS_TABLE = process.env.AIRTABLE_REQUESTS_TABLE || "AccessRequests";
const MEMBERS_TABLE = process.env.AIRTABLE_MEMBERS_TABLE || "ClubMembers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { requestId } = await params;
  const body = await req.json().catch(() => ({}));
  const reviewNotes = String(body.reviewNotes ?? "");
  const nowIso = new Date().toISOString();

  const record = await cachedFind(REQUESTS_TABLE, requestId, 5);
  const f = record.fields as any;

  const clubId = String(f.clubId ?? "");
  const userId = String(f.requesterUserId ?? "");
  if (!clubId || !userId) {
    return NextResponse.json({ error: "Malformed request record." }, { status: 400 });
  }

  // create membership if not exists
  const existingMember = await cachedFirstPage(
    MEMBERS_TABLE,
    { maxRecords: 1, filterByFormula: `AND({clubId}="${clubId}", {userId}="${userId}")` },
    2
  );

  if (existingMember.length === 0) {
    noteCall(MEMBERS_TABLE);
    await base(MEMBERS_TABLE).create([
      { fields: { clubId, userId, memberRole: "leader", createdAt: nowIso } },
    ]);
  }

  noteCall(REQUESTS_TABLE);
  const updated = await base(REQUESTS_TABLE).update([
    {
      id: requestId,
      fields: {
        status: "approved",
        reviewedAt: nowIso,
        reviewNotes,
      },
    },
  ]);

  // Invalidate related caches so list/count endpoints return fresh data
  try {
    invalidateTable(REQUESTS_TABLE);
    invalidateTable(MEMBERS_TABLE);
  } catch (e) {
    console.warn("Failed to invalidate cache after approve", e);
  }

  return NextResponse.json({ request: { recordId: updated[0].id, ...updated[0].fields } });
}
