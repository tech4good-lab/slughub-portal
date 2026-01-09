import { NextResponse } from "next/server";
import { base, CLUBS_TABLE } from "@/lib/airtable";

export async function GET(
  _: Request, 
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { clubId } = await params;

  try {
    // Add logging to help debug
    console.log("Searching for club with clubId:", clubId);

    const records = await base(CLUBS_TABLE)
      .select({ 
        maxRecords: 1, 
        filterByFormula: `{clubId} = "${clubId}"` 
      })
      .firstPage();

    console.log("Found records:", records.length);

    if (records.length === 0) {
      // Log all records to see what's in the table
      const allRecords = await base(CLUBS_TABLE).select({ maxRecords: 10 }).firstPage();
      console.log("Sample records:", allRecords.map(r => ({
        id: r.id,
        clubId: r.fields.clubId,
        name: r.fields.name
      })));
      
      return NextResponse.json({ 
        error: "Not found",
        debug: {
          searchedFor: clubId,
          sampleRecords: allRecords.map(r => r.fields.clubId)
        }
      }, { status: 404 });
    }

    return NextResponse.json({ club: records[0].fields });
  } catch (error) {
    console.error("Error fetching club:", error);
    return NextResponse.json({ 
      error: "Failed to fetch club",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}