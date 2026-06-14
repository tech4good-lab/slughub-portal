import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

function requireAuth(session: any) {
  const userId = session?.userId;
  const role = session?.role;

  if (!userId) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (role !== "leader" && role !== "admin") {
    return {
      ok: false,
      res: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId, role };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;

  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const count = await prisma.accessRequest.count({
      where: {
        status: "pending",
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Prisma Error getting pending access request count:", error);
    return NextResponse.json({ count: 0 });
  }
}

export async function POST(req: Request) {
  console.log("access-requests: POST hit");
  const session = await getServerSession(authOptions);
  const auth = requireAuth(session as any);

  if (!auth.ok) return auth.res;

  const body = await req.json();
  const clubId = String(body.clubId ?? "").trim();
  const message = String(body.message ?? "").trim();
  const clubName = String(body.name ?? "").trim();

  if (!clubId) {
    return NextResponse.json({ error: "clubId is required" }, { status: 400 });
  }

  try {
    const existing = await prisma.accessRequest.findFirst({
      where: {
        clubId: clubId,
        requesterUserId: auth.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let returnData;

    if (existing) {
      if (existing.status === "approved") {
        return NextResponse.json({
          request: { recordId: existing.id, ...existing },
        });
      }

      const updated = await prisma.accessRequest.update({
        where: { id: existing.id },
        data: {
          status: "pending",
          message: message,
          reviewNotes: null,
          reviewedAt: null,
        },
      });
      returnData = updated;
    } else {
      const created = await prisma.accessRequest.create({
        data: {
          clubId: clubId,
          requesterUserId: auth.userId,
          requesterEmail: (session as any)?.user?.email ?? "",
          message: message,
          status: "pending",
        },
      });
      returnData = created;
    }

    try {
      const club = await prisma.club.findUnique({
        where: { id: clubId },
        select: { name: true },
      });

      const recipients = ["communityrag-group@ucsc.edu"];
      const requester = (session as any)?.user?.email ?? auth.userId;
      const subj = `Access request: ${club?.name} by ${requester}`;
      const text = `User ${requester} requested access to club ${clubId}.\n\nMessage: ${message || "(none)"}\n\nView access requests in the admin panel.`;

      const sent = await sendMail({
        to: recipients,
        subject: subj,
        text,
      }).catch((e) => {
        console.warn("sendMail failed", e);
        return false;
      });
      console.log("access-requests: sendMail result=", sent);
    } catch (e) {
      console.warn("Failed to notify recipients of access request", e);
    }

    return NextResponse.json({
      request: { recordId: returnData.id, ...returnData },
    });
  } catch (error) {
    console.error("Prisma POST Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
