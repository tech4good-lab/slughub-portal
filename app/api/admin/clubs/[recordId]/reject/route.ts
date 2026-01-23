import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { base, CLUBS_TABLE, invalidateTable, noteCall } from "@/lib/airtable";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ recordId: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { recordId } = await params;
  const body = await req.json().catch(() => ({}));
  const reviewNotes = String(body.reviewNotes ?? "");

  noteCall(CLUBS_TABLE);
  const updated = await base(CLUBS_TABLE).update([
    {
      id: recordId,
      fields: {
        status: "rejected",
        reviewedAt: new Date().toISOString(),
        reviewNotes,
      },
    },
  ]);

  try {
    invalidateTable(CLUBS_TABLE);
  } catch (e) {
    console.warn("Failed to invalidate clubs cache after reject", e);
  }

  return NextResponse.json({ club: { recordId: updated[0].id, ...updated[0].fields } });
}
