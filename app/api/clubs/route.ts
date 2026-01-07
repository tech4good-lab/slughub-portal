import { NextResponse } from "next/server";
import { base, CLUBS_TABLE } from "@/lib/airtable";

export async function GET() {
  const records = await base(CLUBS_TABLE)
    .select({ sort: [{ field: "updatedAt", direction: "desc" }] })
    .firstPage();

  return NextResponse.json({ clubs: records.map((r) => r.fields) });
}
