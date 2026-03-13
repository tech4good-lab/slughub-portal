import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CLUB_MEMBERS_TABLE, cachedAll } from "@/lib/airtable";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await cachedAll(
    CLUB_MEMBERS_TABLE,
    { filterByFormula: `{userId}="${userId}"` },
    300
  );

  const clubIds = (records || [])
    .map((r: any) => String((r.fields as any)?.clubId ?? "").trim())
    .filter(Boolean);

  return NextResponse.json({ clubIds });
}
