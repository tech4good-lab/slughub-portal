import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { base } from "@/lib/airtable";

const REQUESTS_TABLE = process.env.AIRTABLE_REQUESTS_TABLE || "AccessRequests";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { requestId } = await params;
  const body = await req.json().catch(() => ({}));
  const reviewNotes = String(body.reviewNotes ?? "");
  const nowIso = new Date().toISOString();

  const updated = await base(REQUESTS_TABLE).update([
    {
      id: requestId,
      fields: {
        status: "rejected",
        reviewedAt: nowIso,
        reviewNotes,
      },
    },
  ]);

  return NextResponse.json({ request: { recordId: updated[0].id, ...updated[0].fields } });
}
