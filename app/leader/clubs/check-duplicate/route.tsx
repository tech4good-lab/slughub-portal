import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Name parameter required" }, { status: 400 });
  }

  // Look for an existing club with the same name (case-insensitive)
  const existingClub = await prisma.club.findFirst({
    where: {
      name: {
        equals: name.trim(),
        mode: "insensitive",
      },
    },
  });

  return NextResponse.json({ exists: !!existingClub });
}