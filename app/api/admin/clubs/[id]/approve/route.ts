import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;

  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const reviewNotes = String(body.reviewNotes ?? "");

  try {
    const updatedClub = await prisma.club.update({
      where: {
        id: id,
      },
      data: {
        status: "approved",
        reviewedAt: new Date(),
        reviewNotes: reviewNotes,
      },
    });

    try {
      if (updatedClub.contactEmail) {
        const recipientName = updatedClub.contactName || "Community Leader";

        await sendMail({
          to: [updatedClub.contactEmail],
          subject: `Community Approved: ${updatedClub.name}`,
          text: `Hi ${recipientName},\n\nGreat news! Your community, "${updatedClub.name}," has been reviewed and approved!\n\nYou can now log in to the dashboard to manage your community page.\n${reviewNotes ? `Admin Notes: ${reviewNotes}` : ""}\nBest,\nThe Tech4Good Lab`,
        });

        console.log(
          `Success: Approval email sent to ${updatedClub.contactEmail}`,
        );
      } else {
        console.warn(
          "No contactEmail found for this club; skipping approval email.",
        );
      }
    } catch (mailError) {
      console.error("Failed to send approval email:", mailError);
    }

    return NextResponse.json({
      club: {
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
