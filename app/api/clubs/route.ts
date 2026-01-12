import { NextResponse } from "next/server";
import { base, CLUBS_TABLE } from "@/lib/airtable";

export async function GET() {
  const records = await base(CLUBS_TABLE)
    .select({
      filterByFormula: `{status} = "approved"`,
      sort: [{ field: "updatedAt", direction: "desc" }],
    })
    .firstPage();

  const clubs = records.map((r) => ({
    recordId: r.id,
    ...r.fields,
  }));

  return NextResponse.json({ clubs });
}
