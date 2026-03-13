import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cachedAll, CLUBS_TABLE } from "@/lib/airtable";

const REQUESTS_TABLE = process.env.AIRTABLE_REQUESTS_TABLE || "AccessRequests";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const records = await cachedAll(
    REQUESTS_TABLE,
    { filterByFormula: `LOWER(TRIM({status})) = "pending"`, sort: [{ field: "createdAt", direction: "desc" }] },
    600
  );

  const clubs = await cachedAll(
    CLUBS_TABLE,
    { sort: [{ field: "updatedAt", direction: "desc" }] },
    600
  );
  const clubNameById = new Map<string, string>();
  for (const c of clubs || []) {
    const f = (c.fields as any) ?? {};
    const cid = String(f.clubId ?? "").trim();
    const name = String(f.name ?? "").trim();
    if (name) {
      if (cid) clubNameById.set(cid, name);
      clubNameById.set(c.id, name);
    }
  }

  const requests = records.map((r: any) => ({
    recordId: r.id,
    ...r.fields,
    clubName:
      (r.fields as any)?.clubName ??
      (r.fields as any)?.name ??
      clubNameById.get(String((r.fields as any)?.clubId ?? "").trim()) ??
      "",
  }));
  return NextResponse.json({ requests });
}
