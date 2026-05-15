/*
API endpoint for clubs/new 

 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {

  // runs when someone makes a GET request such as requesting a URL
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role !== "leader" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  //login check
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name")?.trim() ?? "";

  //grabs club name from url
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    const match = await prisma.club.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    //searches database with name, case insensitve
    // returns club info if duplicate found
    if (match) {
      return NextResponse.json({
        duplicate: true,
        club: { id: match.id, name: match.name, status: match.status },
      });
    }

    return NextResponse.json({ duplicate: false });
  } catch (error) {
    console.error("Prisma Error checking duplicate club name:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}