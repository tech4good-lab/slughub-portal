import { NextResponse } from "next/server";
import { base, CLUBS_TABLE } from "@/lib/airtable";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { clubId } = await params;

  try {
    // clubId is actually the recordId (recXXXX format)
    const record = await base(CLUBS_TABLE).find(clubId);
    const fields: any = record.fields;

    // Only show approved clubs publicly
    if (fields.status !== "approved") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      club: { 
        recordId: record.id, 
        ...fields 
      } 
    });
  } catch (error) {
    console.error("Error fetching club:", error);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}