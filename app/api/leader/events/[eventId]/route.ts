import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { base, EVENTS_TABLE, CLUB_MEMBERS_TABLE, cachedAll, cachedFind, invalidateTable, noteCall } from "@/lib/airtable";

function buildEventDate(date: string, time: string) {
  const d = String(date ?? "").trim();
  const t = String(time ?? "").trim();
  if (!d) return "";
  if (!t) return d;
  const combined = new Date(`${d}T${t}`);
  if (Number.isNaN(combined.getTime())) return d;
  return combined.toISOString();
}

async function isMember(userId: string, clubId: string) {
  const memberRows = await cachedAll(
    CLUB_MEMBERS_TABLE,
    { filterByFormula: `{userId}="${userId}"` },
    300
  );
  return (memberRows || []).some(
    (r: any) => String((r.fields as any)?.clubId ?? "") === clubId
  );
}

async function getUserClubIds(userId: string): Promise<string[]> {
  const memberRows = await cachedAll(
    CLUB_MEMBERS_TABLE,
    { filterByFormula: `{userId}="${userId}"` },
    300
  );
  return (memberRows || [])
    .map((r: any) => String((r.fields as any)?.clubId ?? ""))
    .filter(Boolean);
}

async function getUserEvents(userId: string) {
  const clubIds = await getUserClubIds(userId);
  if (clubIds.length === 0) return [];
  const parts = clubIds.map((id: string) => `{clubId}="${id}"`);
  const filterByFormula = `OR(${parts.join(",")})`;
  const eventRows = await cachedAll(
    EVENTS_TABLE,
    { filterByFormula, sort: [{ field: "eventDate", direction: "desc" }] },
    3600
  );
  return eventRows || [];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "leader" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { eventId } = await params;
  const eventRows = await getUserEvents(userId);
  const eventRec = (eventRows || []).find((r: any) => r.id === eventId);
  if (!eventRec) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const f = eventRec.fields as any;
  const clubId = String(f?.clubId ?? "");
  if (!clubId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ event: { recordId: eventRec.id, ...f } });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session as any)?.userId;
    const role = (session as any)?.role;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (role !== "leader" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { eventId } = await params;
    const eventRows = await getUserEvents(userId);
    const eventRec = (eventRows || []).find((r: any) => r.id === eventId);
    if (!eventRec) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const f = eventRec.fields as any;
    const clubId = String(f?.clubId ?? "");
    if (!clubId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const eventTitle = String(body.eventTitle ?? "").trim();
    const eventDateRaw = String(body.eventDate ?? "").trim();
    const eventTimeRaw = String(body.eventTime ?? "").trim();

    if (!eventTitle) {
      return NextResponse.json({ error: "Event title is required." }, { status: 400 });
    }
    if (!eventDateRaw) {
      return NextResponse.json({ error: "Event date is required." }, { status: 400 });
    }

    const payload: any = {
      name: eventTitle,
      eventTitle,
      eventDate: buildEventDate(eventDateRaw, eventTimeRaw),
      eventLocation: String(body.eventLocation ?? "").trim(),
      eventDescription: String(body.eventDescription ?? "").trim(),
      iceBreakers: String(body.IceBreakers ?? body.iceBreakers ?? "").trim(),
    };

    noteCall(EVENTS_TABLE);
    const updated = await base(EVENTS_TABLE).update([{ id: eventRec.id, fields: payload }]);

    try {
      invalidateTable(EVENTS_TABLE);
    } catch (e) {
      console.warn("Failed to invalidate events cache", e);
    }

    const updatedFields = updated[0].fields as any;
    return NextResponse.json({ event: { recordId: updated[0].id, ...updatedFields } });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
