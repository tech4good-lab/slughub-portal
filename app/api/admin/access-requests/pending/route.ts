import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { base } from "@/lib/airtable";

const REQUESTS_TABLE = process.env.AIRTABLE_REQUESTS_TABLE || "AccessRequests";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const records = await base(REQUESTS_TABLE)
    .select({
      filterByFormula: `LOWER(TRIM({status})) = "pending"`,
      // If your table has createdAt, keep this. If it errors, remove sort.
      sort: [{ field: "createdAt", direction: "desc" }],
    })
    .all();

  const requests = records.map((r) => ({ recordId: r.id, ...r.fields }));
  return NextResponse.json({ requests });
}
