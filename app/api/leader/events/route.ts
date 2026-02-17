import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { base, EVENTS_TABLE, invalidateTable, noteCall } from "@/lib/airtable";
import { getUserClubIds } from "@/lib/permissions";

function buildEventDate(date: string, time: string) {
  const d = String(date ?? "").trim();
  const t = String(time ?? "").trim();
  if (!d) return "";

  if (!t) return d;

  const combined = new Date(`${d}T${t}`);
  if (Number.isNaN(combined.getTime())) return d;
  return combined.toISOString();
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session as any)?.userId;
    const role = (session as any)?.role;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (role !== "leader" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const clubId = String(body.clubId ?? "").trim();
    const eventTitle = String(body.eventTitle ?? "").trim();
    const eventDateRaw = String(body.eventDate ?? "").trim();
    const eventTimeRaw = String(body.eventTime ?? "").trim();

    if (!clubId) {
      return NextResponse.json({ error: "Club is required." }, { status: 400 });
    }
    if (!eventTitle) {
      return NextResponse.json({ error: "Event title is required." }, { status: 400 });
    }
    if (!eventDateRaw) {
      return NextResponse.json({ error: "Event date is required." }, { status: 400 });
    }

    const clubIds = await getUserClubIds(userId);
    if (!clubIds.includes(clubId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const nowIso = new Date().toISOString();
    const payload: any = {
      clubId,
      ownerUserId: userId,
      name: eventTitle,
      eventTitle,
      eventDate: buildEventDate(eventDateRaw, eventTimeRaw),
      eventLocation: String(body.eventLocation ?? "").trim(),
      eventDescription: String(body.eventDescription ?? "").trim(),
      IceBreakers: String(body.IceBreakers ?? "").trim(),
      createdAt: nowIso,
    };

    noteCall(EVENTS_TABLE);
    const created = await base(EVENTS_TABLE).create([{ fields: payload }]);

    try {
      invalidateTable(EVENTS_TABLE);
    } catch (e) {
      console.warn("Failed to invalidate events cache", e);
    }

    const createdFields = created[0].fields as any;
    return NextResponse.json({ event: { recordId: created[0].id, ...createdFields } });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
