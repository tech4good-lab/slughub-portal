import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { base, invalidateTable, noteCall, cachedFind, cachedFirstPage, CLUBS_TABLE } from "@/lib/airtable";
import crypto from "crypto";

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

  // Ensure the club is marked verified when a leader is approved.
  let resolvedClubId: string | null = null;
  let clubName: string | null = null;
  try {
    let clubRecordId: string | null = null;

    if (clubId.startsWith("rec")) {
      const clubRec = await cachedFind(CLUBS_TABLE, clubId, 5);
      clubRecordId = clubRec?.id ?? null;
      const clubFields = (clubRec?.fields as any) ?? {};
      resolvedClubId = String(clubFields?.clubId ?? "").trim() || null;
      clubName = String(clubFields?.name ?? "").trim() || null;
    } else {
      const clubRec = await cachedFirstPage(
        CLUBS_TABLE,
        { maxRecords: 1, filterByFormula: `{clubId}="${clubId}"` },
        5
      );
      clubRecordId = clubRec.length > 0 ? clubRec[0].id : null;
      resolvedClubId =
        clubRec.length > 0 ? String((clubRec[0].fields as any)?.clubId ?? "").trim() || null : null;
      clubName =
        clubRec.length > 0 ? String((clubRec[0].fields as any)?.name ?? "").trim() || null : null;
      if (!clubRecordId) {
        const fallbackById = await cachedFind(CLUBS_TABLE, clubId, 5).catch(() => null);
        clubRecordId = (fallbackById as any)?.id ?? null;
        const fbFields = (fallbackById as any)?.fields ?? {};
        resolvedClubId = String(fbFields?.clubId ?? "").trim() || null;
        clubName = String(fbFields?.name ?? "").trim() || null;
      }
    }

    if (!clubRecordId) {
      const memberRec = await cachedFirstPage(
        MEMBERS_TABLE,
        {
          maxRecords: 1,
          filterByFormula: `AND({userId}="${userId}", OR({clubId}="${clubId}", {clubId}=""))`,
        },
        2
      );
      const memberName = String((memberRec[0]?.fields as any)?.name ?? "").trim();
      if (memberName) {
        clubName = memberName;
        const nameEscaped = memberName.replace(/"/g, '\\"');
        const clubByName = await cachedFirstPage(
          CLUBS_TABLE,
          { maxRecords: 1, filterByFormula: `{name}="${nameEscaped}"` },
          5
        );
        if (clubByName.length > 0) {
          clubRecordId = clubByName[0].id;
          resolvedClubId =
            String((clubByName[0].fields as any)?.clubId ?? "").trim() || null;
        }
      }
    }

    if (clubRecordId) {
      const finalClubId = resolvedClubId || crypto.randomUUID();
      resolvedClubId = finalClubId;
      noteCall(CLUBS_TABLE);
      await base(CLUBS_TABLE).update([
        { id: clubRecordId, fields: { communityStatus: ["Verified"], clubId: finalClubId } },
      ]);
    }
  } catch (e) {
    console.warn("Failed to set communityStatus=Verified after access approval", e);
  }

  const finalClubId = resolvedClubId ?? clubId;

  // create membership if not exists
  const existingMember = await cachedFirstPage(
    MEMBERS_TABLE,
    { maxRecords: 1, filterByFormula: `AND({clubId}="${finalClubId}", {userId}="${userId}")` },
    2
  );

  if (existingMember.length === 0) {
    noteCall(MEMBERS_TABLE);
    await base(MEMBERS_TABLE).create([
      {
        fields: {
          clubId: finalClubId,
          userId,
          name: clubName ?? undefined,
          memberRole: "leader",
          createdAt: nowIso,
        },
      },
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
        clubId: finalClubId,
      },
    },
  ]);

  // Invalidate related caches so list/count endpoints return fresh data
  try {
    invalidateTable(REQUESTS_TABLE);
    invalidateTable(MEMBERS_TABLE);
    invalidateTable(CLUBS_TABLE);
  } catch (e) {
    console.warn("Failed to invalidate cache after approve", e);
  }

  return NextResponse.json({ request: { recordId: updated[0].id, ...updated[0].fields } });
}
