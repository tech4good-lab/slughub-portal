import { NextResponse } from "next/server";
import { CLUBS_TABLE, cachedFirstPage, cachedFind } from "@/lib/airtable";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { clubId } = await params;

  try {
    // Case A: Airtable record id (legacy links) look like "recXXXXXXXX..."
    if (clubId.startsWith("rec")) {
      const record = await cachedFind(CLUBS_TABLE, clubId, 30);

      // Public route: only show approved
      if (record.fields?.status !== "approved") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json({ club: { recordId: record.id, ...record.fields } });
    }

    // Case B: UUID clubId stored in a field called "clubId"
    const records = await cachedFirstPage(
      CLUBS_TABLE,
      { maxRecords: 1, filterByFormula: `AND({clubId} = "${clubId}", {status} = "approved")` },
      30
    );

    if (!records || records.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const r = records[0];
    return NextResponse.json({ club: { recordId: r.id, ...r.fields } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
