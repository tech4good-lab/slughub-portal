import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function buildEventDate(date: string, time: string) {
  const d = String(date ?? "").trim();
  const t = String(time ?? "").trim();

  if (!d) return null;

  const dateStr = t ? `${d}T${t}` : d;
  const combined = new Date(dateStr);

  return Number.isNaN(combined.getTime()) ? null : combined;
}

async function verifyAccess(
  userId: string,
  clubId: string,
  globalRole: string,
) {
  if (globalRole === "admin") return true;

  const membership = await prisma.clubMember.findUnique({
    where: {
      userId_clubId: { userId: userId, clubId: clubId },
    },
  });

  if (!membership) return false;
  return (
    membership.memberRole === "leader" || membership.memberRole === "admin"
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "leader" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { eventId } = await params;

  try {
    const event = await prisma.clubEvent.findUnique({
      where: { id: eventId },
      include: { club: true },
    });

    if (!event)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const hasAccess = await verifyAccess(userId, event.clubId, role);
    if (!hasAccess)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({
      event: {
        ...event,
        clubName: event.club?.name || "No Name Found",
      },
    });
  } catch (error) {
    console.error(`Prisma Error fetching event ${eventId}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session as any)?.userId;
    const role = (session as any)?.role;

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (role !== "leader" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { eventId } = await params;

    const existingEvent = await prisma.clubEvent.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const hasAccess = await verifyAccess(userId, existingEvent.clubId, role);
    if (!hasAccess)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const eventTitle = String(body.eventTitle ?? "").trim();
    const eventDateRaw = String(body.eventDate ?? "").trim();
    const eventTimeRaw = String(body.eventTime ?? "").trim();

    if (!eventTitle) {
      return NextResponse.json(
        { error: "Event title is required." },
        { status: 400 },
      );
    }
    if (!eventDateRaw) {
      return NextResponse.json(
        { error: "Event date is required." },
        { status: 400 },
      );
    }

    const parsedDate = buildEventDate(eventDateRaw, eventTimeRaw);
    if (!parsedDate) {
      return NextResponse.json(
        { error: "Invalid date format." },
        { status: 400 },
      );
    }

    const updatedEvent = await prisma.clubEvent.update({
      where: { id: eventId },
      data: {
        name: eventTitle,
        eventTitle: eventTitle,
        eventDate: parsedDate,
        eventLocation: String(body.eventLocation ?? "").trim(),
        eventDescription: String(body.eventDescription ?? "").trim(),
        iceBreakers: String(body.IceBreakers ?? body.iceBreakers ?? "").trim(),
        zoomLink: String(body.zoomLink ?? "").trim(),
      },
    });

    return NextResponse.json({
      event: {
        recordId: updatedEvent.id,
        ...updatedEvent,
      },
    });
  } catch (e: any) {
    console.error("Prisma Error updating event:", e);
    return NextResponse.json(
      { error: e?.message ?? "Internal error" },
      { status: 500 },
    );
  }
}
