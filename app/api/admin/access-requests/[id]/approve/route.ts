import { NextRequest, NextResponse } from "next/server"; // Changed to NextRequest
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest, // Using NextRequest is safer for App Router types
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;

  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const requestId = id;

  const body = await req.json().catch(() => ({}));
  const reviewNotes = String(body.reviewNotes ?? "");
  const clubNameFallback = String(body.clubName ?? "").trim();

  try {
    const accessRequest = await prisma.accessRequest.findUnique({
      where: { id: requestId },
    });

    if (!accessRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const clubId = String(body.clubId ?? accessRequest.clubId);
    const userId = String(
      body.requesterUserId ?? accessRequest.requesterUserId,
    );

    if (!clubId || !userId) {
      return NextResponse.json(
        { error: "Malformed request record." },
        { status: 400 },
      );
    }

    // Update Club Status
    try {
      const club = await prisma.club.findUnique({ where: { id: clubId } });
      if (club && club.status !== "approved") {
        await prisma.club.update({
          where: { id: clubId },
          data: {
            communityStatus: "verified",
            status: "approved",
            reviewedAt: new Date(),
          },
        });
      }
    } catch (e) {
      console.warn("Failed to update club status during approval", e);
    }

    await prisma.clubMember.upsert({
      where: {
        userId_clubId: { userId: userId, clubId: clubId },
      },
      update: { memberRole: "leader" },
      create: {
        userId: userId,
        clubId: clubId,
        name: clubNameFallback || "Unknown Member",
        memberRole: "leader",
      },
    });

    const updatedRequest = await prisma.accessRequest.update({
      where: { id: requestId },
      data: {
        status: "approved",
        reviewedAt: new Date(),
        reviewNotes: reviewNotes,
      },
    });

    return NextResponse.json({
      request: { recordId: updatedRequest.id, ...updatedRequest },
    });
  } catch (error) {
    console.error("Prisma Error approving access request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
