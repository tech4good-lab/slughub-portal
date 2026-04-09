import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;

  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { requestId } = await params;
  const body = await req.json().catch(() => ({}));
  const reviewNotes = String(body.reviewNotes ?? "");

  try {
    const updatedRequest = await prisma.accessRequest.update({
      where: { id: requestId },
      data: {
        status: "rejected",
        reviewedAt: new Date(),
        reviewNotes: reviewNotes,
      },
    });

    return NextResponse.json({
      request: { recordId: updatedRequest.id, ...updatedRequest },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    console.error("Prisma Error rejecting access request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
