import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { base, CLUBS_TABLE } from "@/lib/airtable";

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

  const updated = await base(CLUBS_TABLE).update([
    {
      id: recordId,
      fields: {
        status: "approved",
        reviewedAt: new Date().toISOString(),
        reviewNotes,
      },
    },
  ]);

  return NextResponse.json({ club: { recordId: updated[0].id, ...updated[0].fields } });
}
