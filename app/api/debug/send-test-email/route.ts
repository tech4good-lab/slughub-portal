import { NextResponse } from "next/server";
import { cachedAll, USERS_TABLE } from "@/lib/airtable";
import sendMail from "@/lib/mail";

// Development-only route to trigger a test email.
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch (_e) {}

  let to: string[] = [];
  if (body?.to) {
    to = Array.isArray(body.to) ? body.to.map(String) : [String(body.to)];
  }

  if (to.length === 0) {
    const admins = await cachedAll(USERS_TABLE, { filterByFormula: `{role} = "admin"` }, 600);
    to = (admins || []).map((r: any) => (r.fields as any)?.email).filter(Boolean);
  }

  if (to.length === 0) return NextResponse.json({ error: "No recipients found" }, { status: 400 });

  const subject = body?.subject || `Test email from Club Portal (${new Date().toISOString()})`;
  const text = body?.text || `This is a test email sent from the local dev server.`;

  try {
    console.log("debug/send-test-email: sending to", to);
    const ok = await sendMail({ to, subject, text });
    console.log("debug/send-test-email: sendMail result=", ok);
    return NextResponse.json({ ok: !!ok, to });
  } catch (e: any) {
    console.warn("debug/send-test-email: failed", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "POST to this endpoint with { to?: string[] } in development to send a test email." });
}
