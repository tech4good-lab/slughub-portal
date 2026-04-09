import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const memberships = await prisma.clubMember.findMany({
      where: {
        userId: userId,
      },
      select: {
        clubId: true,
      },
    });

    const clubIds = memberships.map((m) => m.clubId);

    return NextResponse.json({ clubIds });
  } catch (error) {
    console.error("Prisma Error fetching user club IDs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
