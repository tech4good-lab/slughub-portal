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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session as any)?.userId;
    const role = (session as any)?.role;

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const hasAccess = await verifyAccess(userId, clubId, role);
    if (!hasAccess)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const parsedDate = buildEventDate(eventDateRaw, eventTimeRaw);
    if (!parsedDate) {
      return NextResponse.json(
        { error: "Invalid date format." },
        { status: 400 },
      );
    }

    const createdEvent = await prisma.clubEvent.create({
      data: {
        clubId: clubId,
        ownerUserId: userId,
        name: eventTitle,
        eventTitle: eventTitle,
        eventDate: parsedDate,
        eventLocation: String(body.eventLocation ?? "").trim(),
        zoomLink: String(body.zoomLink ?? "").trim(),
        iceBreakers: String(body.iceBreakers ?? body.iceBreakers ?? "").trim(),
        eventDescription: String(body.eventDescription ?? "").trim(),
      },
    });

    return NextResponse.json({
      event: {
        recordId: createdEvent.id,
        ...createdEvent,
      },
    });
  } catch (e: any) {
    console.error("Prisma Error creating event:", e);
    return NextResponse.json(
      { error: e?.message ?? "Internal error" },
      { status: 500 },
    );
  }
}
