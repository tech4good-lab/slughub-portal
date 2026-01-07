import { NextResponse } from "next/server";
import { base, CLUBS_TABLE } from "@/lib/airtable";

export async function GET(_: Request, { params }: { params: { clubId: string } }) {
  const clubId = params.clubId;

  const records = await base(CLUBS_TABLE)
    .select({ maxRecords: 1, filterByFormula: `{clubId} = "${clubId}"` })
    .firstPage();

  if (records.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ club: records[0].fields });
}
