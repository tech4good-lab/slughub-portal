import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";

export async function GET() {
  const session = await getServerSession(authOptions);

  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  console.log("X-RAY: Parsed User ID ->", userId);
  console.log("X-RAY: Parsed Role    ->", role);

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "leader" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const userClubs = await prisma.club.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const clubs = userClubs.map((club) => ({
      ...club,
    }));

    return NextResponse.json({ clubs });
  } catch (error) {
    console.error("Prisma Error fetching user clubs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log("leader/clubs: POST hit");
    const session = await getServerSession(authOptions);
    const userId = (session as any)?.userId;
    const role = (session as any)?.role;

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (role !== "leader" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Community name is required." },
        { status: 400 },
      );
    }

    const rawCommunityType = body.communityType
      ? String(body.communityType).trim()
      : undefined;

    const newClub = await prisma.club.create({
      data: {
        name: String(body.name).trim(),
        description: String(body.description ?? "").trim(),
        clubIcebreakers: String(body.clubIcebreakers ?? "").trim(),

        communityType: rawCommunityType as any,
        communityStatus: "verified",

        contactName: String(body.contactName ?? "").trim(),
        contactEmail: String(body.contactEmail ?? "").trim(),
        calendarUrl: String(body.calendarUrl ?? "").trim(),
        discordUrl: String(body.discordUrl ?? "").trim(),
        websiteUrl: String(body.websiteUrl ?? "").trim(),
        instagramUrl: String(body.instagramUrl ?? "").trim(),
        linkedinUrl: String(body.linkedinUrl ?? "").trim(),

        status: "pending",
        submittedAt: new Date(),
        reviewNotes: null,

        members: {
          create: {
            userId: userId,
            memberRole: "leader",
            name: String(body.contactName ?? "Club Creator").trim(),
          },
        },
      },
    });

    try {
      revalidatePath("/leader/dashboard");
    } catch (e) {
      console.warn("Failed to revalidate leader dashboard", e);
    }

    try {
      const recipients = ["communityrag-group@ucsc.edu"];
      const subj = `New club request: ${newClub.name}`;
      const emailBody = `A new club was submitted by ${(session as any)?.user?.email ?? userId}.

Name: ${newClub.name}
ClubId: ${newClub.id}
Contact: ${newClub.contactName} <${newClub.contactEmail}>

Review it in the admin panel.`;

      await sendMail({ to: recipients, subject: subj, text: emailBody }).catch(
        (e) => {
          console.warn("sendMail failed", e);
          return false;
        },
      );
    } catch (e) {
      console.warn("Failed to notify recipients of new club", e);
    }

    return NextResponse.json({
      club: {
        recordId: newClub.id,
        ...newClub,
      },
    });
  } catch (e: any) {
    console.error("Prisma Error creating club:", e);
    return NextResponse.json(
      { error: e?.message ?? "Internal error" },
      { status: 500 },
    );
  }
}
