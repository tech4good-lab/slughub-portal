import { NextResponse } from "next/server";
import { CLUBS_TABLE, cachedAll } from "@/lib/airtable";

export async function GET() {
  const records = await cachedAll(
    CLUBS_TABLE,
    { sort: [{ field: "updatedAt", direction: "desc" }] },
    600
  );

  const clubs = records
    .filter((r: any) => String((r.fields as any)?.status ?? "").toLowerCase() === "approved")
    .map((r: any) => {
    const f = r.fields as any;
    return { recordId: r.id, ...f, category: f.Category ?? f.category };
  });

  return NextResponse.json({ clubs });

}
