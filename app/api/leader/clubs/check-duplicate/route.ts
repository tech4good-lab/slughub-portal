/*
API endpoint for clubs/new 

 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "leader" && role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const clubs = await prisma.club.findMany({
      select: { id: true, name: true, status: true },
    });
    return NextResponse.json({ clubs });
  } catch (error) {
    console.error("Prisma Error fetching clubs for duplicate check:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}