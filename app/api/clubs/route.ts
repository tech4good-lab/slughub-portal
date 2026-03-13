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
    const communityType =
      f.communityType ??
      f["community Type"] ??
      f["community type"] ??
      f["Community Type"];
    const communityStatus =
      f.communityStatus ??
      f["community status"] ??
      f["Community Status"];
    return {
      recordId: r.id,
      ...f,
      verification: f.Verification ?? f.verification,
      verified: f.Verified ?? f.verified,
      communityType,
      communityStatus,
    };
  });

  return NextResponse.json({ clubs });

}
