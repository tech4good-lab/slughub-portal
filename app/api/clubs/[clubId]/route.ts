import { NextResponse } from "next/server";
import { base, CLUBS_TABLE } from "@/lib/airtable";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { clubId } = await params;

  try {
    // Case A: Airtable record id (legacy links) look like "recXXXXXXXX..."
    if (clubId.startsWith("rec")) {
      const record = await base(CLUBS_TABLE).find(clubId);
      const fields = record.fields as any;

      // Public route: only show approved
      if (fields.status !== "approved") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json({ club: { recordId: record.id, ...record.fields } });
    }

    // Case B: UUID clubId stored in a field called "clubId"
    const records = await base(CLUBS_TABLE)
      .select({
        maxRecords: 1,
        filterByFormula: `AND({clubId} = "${clubId}", {status} = "approved")`,
      })
      .firstPage();

    if (records.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const r = records[0];
    return NextResponse.json({ club: { recordId: r.id, ...r.fields } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
