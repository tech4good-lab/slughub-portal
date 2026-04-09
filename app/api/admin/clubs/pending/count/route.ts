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
    const count = await prisma.club.count({
      where: {
        status: "pending",
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Prisma Error getting pending club count:", error);
    return NextResponse.json({ count: 0 });
  }
}
