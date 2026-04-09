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
    const pendingRequests = await prisma.accessRequest.findMany({
      where: {
        status: "pending",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const clubIds = Array.from(
      new Set(pendingRequests.map((r) => r.clubId).filter(Boolean)),
    );

    const clubs = await prisma.club.findMany({
      where: {
        id: { in: clubIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const clubNameById = new Map<string, string>();
    for (const club of clubs) {
      clubNameById.set(club.id, club.name);
    }

    const requests = pendingRequests.map((r) => ({
      recordId: r.id,
      ...r,
      clubName: clubNameById.get(r.clubId) ?? "Unknown Club",
    }));

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Prisma Error fetching pending requests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
