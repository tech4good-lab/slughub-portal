import { NextResponse } from "next/server";
import { CLUBS_TABLE, cachedFirstPage } from "@/lib/airtable";

export async function GET() {
  const records = await cachedFirstPage(
    CLUBS_TABLE,
    { filterByFormula: `{status} = "approved"`, sort: [{ field: "updatedAt", direction: "desc" }] },
    30
  );

  const clubs = records.map((r: any) => ({ recordId: r.id, ...r.fields }));

  return NextResponse.json({ clubs });
}
