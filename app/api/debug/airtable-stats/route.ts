import { NextResponse } from "next/server";
import { airtableStats, setForceNoCache } from "@/lib/airtable";

export async function GET() {
  return NextResponse.json({ stats: airtableStats });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body?.action === "reset") {
    airtableStats.calls = 0;
    airtableStats.perTable = {};
    return NextResponse.json({ ok: true });
  }

  if (body?.action === "setForceNoCache") {
    const v = !!body.value;
    setForceNoCache(v);
    return NextResponse.json({ ok: true, forceNoCache: v });
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
