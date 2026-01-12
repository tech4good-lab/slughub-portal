import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { base, CLUBS_TABLE } from "@/lib/airtable";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const records = await base(CLUBS_TABLE)
    .select({
      filterByFormula: `{status} = "pending"`,
      sort: [{ field: "submittedAt", direction: "desc" }],
    })
    .firstPage();

  const clubs = records.map((r) => ({
    recordId: r.id,
    ...r.fields,
  }));

  return NextResponse.json({ clubs });
}
