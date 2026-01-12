import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { base, CLUBS_TABLE } from "@/lib/airtable";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const records = await base(CLUBS_TABLE)
      .select({
        filterByFormula: `{status} = "pending"`,
        fields: ["clubId"], // Only fetch minimal data for count
      })
      .firstPage();

    return NextResponse.json({ count: records.length });
  } catch (error) {
    console.error("Failed to get pending count:", error);
    return NextResponse.json({ count: 0 });
  }
}