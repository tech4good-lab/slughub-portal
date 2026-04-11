import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;

  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const pendingClubs = await prisma.club.findMany({
      where: {
        status: "pending",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const clubs = pendingClubs.map((club: any) => ({
      recordId: club.id,
      ...club,
    }));

    return NextResponse.json({ clubs });
  } catch (error) {
    console.error("Prisma Error fetching pending clubs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
