import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/leader/clubs/check-duplicate?name=<club name>
 *
 * Returns { duplicate: true, club: { id, name, status } } if a club with a
 * matching name already exists (case-insensitive), or { duplicate: false }
 * if the name is available.
 *
 * Any authenticated leader or admin may call this endpoint.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  console.log("FULL SESSION:", JSON.stringify(session, null, 2));  // add this
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;


  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role !== "leader" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name")?.trim() ?? "";

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    // Prisma doesn't support case-insensitive filtering on all DB engines
    // via a simple flag, so we fetch all clubs whose lowercased name matches.
    // For most portals this list is small; if it ever grows, add a DB index
    // on lower(name) and use a raw query instead.
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

    console.log("name searched:", name);
    console.log("match found:", match);

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