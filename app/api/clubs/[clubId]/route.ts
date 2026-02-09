import { NextResponse } from "next/server";
import { CLUBS_TABLE, cachedAll } from "@/lib/airtable";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { clubId } = await params;

  try {
    const records = await cachedAll(
      CLUBS_TABLE,
      { filterByFormula: `{status} = "approved"`, sort: [{ field: "updatedAt", direction: "desc" }] },
      600,
      { scope: "public", allowStale: true }
    );

    const match = (records || []).find((r: any) => {
      const f = r.fields as any;
      if (clubId.startsWith("rec")) return r.id === clubId;
      return String(f?.clubId ?? "") === clubId;
    });

    if (!match) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const f = match.fields as any;
    return NextResponse.json({ club: { recordId: match.id, ...f, category: f.Category ?? f.category } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
