import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CLUBS_TABLE, cachedAll } from "@/lib/airtable";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const records = await cachedAll(
    CLUBS_TABLE,
    { filterByFormula: `{status} = "pending"`, sort: [{ field: "submittedAt", direction: "desc" }] },
    600,
    { scope: "admin", allowStale: true }
  );

  const clubs = records.map((r: any) => ({ recordId: r.id, ...r.fields }));

  return NextResponse.json({ clubs });
}
