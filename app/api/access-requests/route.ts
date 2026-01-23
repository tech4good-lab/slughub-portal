import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { base, ACCESS_REQUESTS_TABLE, invalidateTable, noteCall, cachedFirstPage } from "@/lib/airtable";

function requireAuth(session: any) {
  const userId = session?.userId;
  const role = session?.role;
  if (!userId) return { ok: false, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (role !== "leader" && role !== "admin") {
    return { ok: false, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true, userId, role };
}

// GET /api/access-requests?clubId=...
// Returns *your* access request status for this club (if logged in)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const auth = requireAuth(session as any);
  if (!auth.ok) return auth.res;

  const url = new URL(req.url);
  const clubId = (url.searchParams.get("clubId") ?? "").trim();
  if (!clubId) {
    return NextResponse.json({ error: "clubId is required" }, { status: 400 });
  }

  const records = await cachedFirstPage(
    ACCESS_REQUESTS_TABLE,
    {
      maxRecords: 1,
      filterByFormula: `AND({clubId} = "${clubId}", {requesterUserId} = "${auth.userId}")`,
      sort: [{ field: "createdAt", direction: "desc" }],
    },
    600
  );

  const r = records[0];
  return NextResponse.json({
    request: r ? { recordId: r.id, ...r.fields } : null,
  });
}

// POST /api/access-requests
// Body: { clubId: string, message?: string }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const auth = requireAuth(session as any);
  if (!auth.ok) return auth.res;

  const body = await req.json();
  const clubId = String(body.clubId ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!clubId) {
    return NextResponse.json({ error: "clubId is required" }, { status: 400 });
  }

  const nowIso = new Date().toISOString();

  // Upsert: if they already requested for this club, update it
  const existing = await cachedFirstPage(
    ACCESS_REQUESTS_TABLE,
    {
      maxRecords: 1,
      filterByFormula: `AND({clubId} = "${clubId}", {requesterUserId} = "${auth.userId}")`,
      sort: [{ field: "createdAt", direction: "desc" }],
    },
    600
  );

  if (existing.length > 0) {
    const rec = existing[0];
    const fields: any = rec.fields;

    // If approved already, just return it (don’t spam requests)
    if (fields.status === "approved") {
      return NextResponse.json({ request: { recordId: rec.id, ...rec.fields } });
    }

    // If rejected/pending, resubmit as pending (clear reviewed fields safely)
    noteCall(ACCESS_REQUESTS_TABLE);
    const updated = await base(ACCESS_REQUESTS_TABLE).update([
      {
        id: rec.id,
        fields: {
          status: "pending",
          message,
          reviewNotes: "",
          reviewedAt: undefined, // IMPORTANT: use null, not ""
          createdAt: nowIso,
        },
      },
    ]);

    try {
      invalidateTable(ACCESS_REQUESTS_TABLE);
    } catch (e) {
      console.warn("Failed to invalidate access requests cache", e);
    }

    return NextResponse.json({ request: { recordId: updated[0].id, ...updated[0].fields } });
  }

  noteCall(ACCESS_REQUESTS_TABLE);
  const created = await base(ACCESS_REQUESTS_TABLE).create([
    {
      fields: {
        clubId,
        requesterUserId: auth.userId,
        requesterEmail: session?.user?.email ?? "",
        message,
        status: "pending",
        reviewNotes: "",
        createdAt: nowIso,
        reviewedAt: undefined, // IMPORTANT: use null, not ""
      },
    },
  ]);
  try {
    invalidateTable(ACCESS_REQUESTS_TABLE);
  } catch (e) {
    console.warn("Failed to invalidate access requests cache", e);
  }

  return NextResponse.json({ request: { recordId: created[0].id, ...created[0].fields } });
}


