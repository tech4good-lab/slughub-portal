import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ACCESS_REQUESTS_TABLE, cachedFirstPage } from "@/lib/airtable";

function requireAuth(session: any) {
  const userId = session?.userId;
  const role = session?.role;

  if (!userId) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (role !== "leader" && role !== "admin") {
    return {
      ok: false,
      res: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId, role };
}

// GET /api/access-requests/mine
// Returns your latest access request per club (one call for all clubs)
export async function GET(_req: Request) {
  const session = await getServerSession(authOptions);
  const auth = requireAuth(session as any);
  if (!auth.ok) return auth.res;

  // Pull all requests for this user, newest first
  const records = await cachedFirstPage(
    ACCESS_REQUESTS_TABLE,
    {
      maxRecords: 500,
      filterByFormula: `{requesterUserId} = "${auth.userId}"`,
      sort: [{ field: "createdAt", direction: "desc" }],
    },
    60 // short TTL; POST invalidates table anyway
  );

  // Keep only the newest request per clubId
  const latestByClubId = new Map<string, any>();

  for (const r of records) {
    const clubId = String((r.fields as any)?.clubId ?? "").trim();
    if (!clubId) continue;

    // Because we're sorted desc, first time we see a clubId is the latest
    if (!latestByClubId.has(clubId)) {
      latestByClubId.set(clubId, { recordId: r.id, ...r.fields });
    }
  }

  return NextResponse.json({
    byClubId: Object.fromEntries(latestByClubId.entries()),
    requests: Array.from(latestByClubId.values()),
  });
}
