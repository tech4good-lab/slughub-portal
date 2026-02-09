import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CLUBS_TABLE, cachedCount } from "@/lib/airtable";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const count = await cachedCount(
      CLUBS_TABLE,
      { filterByFormula: `{status} = "pending"`, fields: ["clubId"] },
      600,
      { scope: "admin", allowStale: true }
    );

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Failed to get pending count:", error);
    return NextResponse.json({ count: 0 });
  }
}
