import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CLUBS_TABLE, cachedAll } from "@/lib/airtable";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const records = await cachedAll(
    CLUBS_TABLE,
    { sort: [{ field: "updatedAt", direction: "desc" }] },
    600,
    { scope: "clubs", allowStale: true }
  );

  const clubs = records
    .filter((r: any) => String((r.fields as any)?.status ?? "").toLowerCase() === "pending")
    .sort((a: any, b: any) => {
      const aTime = Date.parse(String((a.fields as any)?.submittedAt ?? "")) || 0;
      const bTime = Date.parse(String((b.fields as any)?.submittedAt ?? "")) || 0;
      return bTime - aTime;
    })
    .map((r: any) => ({ recordId: r.id, ...r.fields }));

  return NextResponse.json({ clubs });
}
