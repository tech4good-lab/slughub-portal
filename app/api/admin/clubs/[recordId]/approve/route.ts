import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ recordId: string }> },
) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;

  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { recordId } = await params;
  const body = await req.json().catch(() => ({}));
  const reviewNotes = String(body.reviewNotes ?? "");

  try {
    const updatedClub = await prisma.club.update({
      where: {
        id: recordId,
      },
      data: {
        status: "approved",
        reviewedAt: new Date(),
        reviewNotes: reviewNotes,
      },
    });

    return NextResponse.json({
      club: {
        recordId: updatedClub.id,
        ...updatedClub,
      },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    console.error("Prisma Error approving club:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
