  import { NextResponse } from "next/server";
  import { prisma } from "@/lib/prisma";

  export async function GET() {
    try {
      const approvedClubs = await prisma.club.findMany({
        where: {
          status: "approved",
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      const clubs = approvedClubs.map((club: any) => ({
        recordId: club.id,
        ...club,
      }));

      return NextResponse.json({ clubs });
    } catch (error) {
      console.error("Prisma Error fetching approved clubs:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }
