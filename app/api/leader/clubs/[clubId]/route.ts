import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  { params }: { params: Promise<{ clubId: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "leader" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clubId } = await params;

  const hasAccess = await verifyAccess(userId, clubId, role);
  if (!hasAccess)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      club: {
        recordId: club.id,
        ...club,
      },
    });
  } catch (error) {
    console.error(`Prisma Error fetching club ${clubId}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// app/api/leader/clubs/[clubId]/route.ts
export async function POST(
  req: Request,
  { params }: { params: Promise<{ clubId: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "leader" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clubId } = await params;

  const hasAccess = await verifyAccess(userId, clubId, role);
  if (!hasAccess)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const rawCommunityType = body.communityType
    ? String(body.communityType).trim()
    : undefined;

  const data: any = {
    name: String(body.name ?? "").trim(),
    description: String(body.description ?? "").trim(),
    contactName: String(body.contactName ?? "").trim(),
    contactEmail: String(body.contactEmail ?? "").trim(),
    communityType: rawCommunityType as any,
    calendarUrl: String(body.calendarUrl ?? "").trim(),
    discordUrl: String(body.discordUrl ?? "").trim(),
    websiteUrl: String(body.websiteUrl ?? "").trim(),
    instagramUrl: String(body.instagramUrl ?? "").trim(),
    linkedinUrl: String(body.linkedinUrl ?? "").trim(),
    updatedAt: new Date(),
  };

  // Edits to an existing club go live immediately for both leaders and
  // admins — no re-review needed. We intentionally do NOT touch
  // `status`, `submittedAt`, or `reviewNotes` here, so an approved club
  // stays approved (and a pending/rejected one keeps its existing
  // review state, independent of content edits).
  if (role === "admin") {
    const allowedStatuses = ["approved", "pending", "rejected"];
    data.status = allowedStatuses.includes(String(body.status))
      ? String(body.status)
      : "approved";
    data.reviewedAt = new Date();
  }

  try {
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data,
    });

    try {
      revalidatePath("/leader/dashboard");
      revalidatePath("/");
      revalidatePath(`/clubs/${clubId}`);
    } catch (e) {
      console.warn("Failed to revalidate paths after club update", e);
    }

    return NextResponse.json({
      club: { recordId: updatedClub.id, ...updatedClub },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error(`Prisma Error updating club ${clubId}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ clubId: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "leader" && role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { clubId } = await params;

  const hasAccess = await verifyAccess(userId, clubId, role);
  if (!hasAccess)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await prisma.$transaction([
      prisma.clubMember.deleteMany({ where: { clubId } }),
      prisma.accessRequest.deleteMany({ where: { clubId } }),
      prisma.clubEvent.deleteMany({ where: { clubId } }),
      prisma.club.delete({ where: { id: clubId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json(
      { error: "Could not delete club. Ensure you have permission." },
      { status: 500 },
    );
  }
}


