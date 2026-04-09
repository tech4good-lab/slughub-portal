import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clubId: string }> },
) {
  const { clubId } = await params;

  try {
    const isAirtableId = clubId.startsWith("rec");

    const club = await prisma.club.findFirst({
      where: {
        ...(isAirtableId ? { airtableId: clubId } : { id: clubId }),

        status: "approved",
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      club: {
        recordId: club.id,
        ...club,
      },
    });
  } catch (error) {
    console.error(`Prisma Error fetching club ${clubId}:`, error);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
