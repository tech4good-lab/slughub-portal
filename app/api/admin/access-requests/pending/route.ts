import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cachedAll } from "@/lib/airtable";

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

  const requests = records.map((r: any) => ({ recordId: r.id, ...r.fields }));
  return NextResponse.json({ requests });
}
