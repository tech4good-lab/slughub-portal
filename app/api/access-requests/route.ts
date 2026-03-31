import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  base,
  ACCESS_REQUESTS_TABLE,
  invalidateTable,
  noteCall,
  cachedFirstPage,
} from "@/lib/airtable";
import { sendMail } from "@/lib/mail";

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


export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const auth = requireAuth(session as any);
  if (!auth.ok) return auth.res;

  const url = new URL(req.url);
  const clubId = (url.searchParams.get("clubId") ?? "").trim();
  if (!clubId) {
    return NextResponse.json({ error: "clubId is required" }, { status: 400 });
  }

  // Latest request for (clubId, requesterUserId)
  const records = await cachedFirstPage(
    ACCESS_REQUESTS_TABLE,
    {
      maxRecords: 1,
      filterByFormula: `AND({clubId} = "${clubId}", {requesterUserId} = "${auth.userId}")`,
      sort: [{ field: "createdAt", direction: "desc" }],
    },
    600
  );

  const r = records[0];

  return NextResponse.json({
    request: r ? { recordId: r.id, ...r.fields } : null,
  });
}


export async function POST(req: Request) {
  console.log("access-requests: POST hit");
  const session = await getServerSession(authOptions);
  const auth = requireAuth(session as any);
  console.log("access-requests: auth", { ok: auth.ok, role: (session as any)?.role, hasUserId: !!(session as any)?.userId });
  if (!auth.ok) return auth.res;

  const body = await req.json();
  const clubId = String(body.clubId ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!clubId) {
    return NextResponse.json({ error: "clubId is required" }, { status: 400 });
  }

  const existing = await cachedFirstPage(
    ACCESS_REQUESTS_TABLE,
    {
      maxRecords: 1,
      filterByFormula: `AND({clubId} = "${clubId}", {requesterUserId} = "${auth.userId}")`,
      sort: [{ field: "createdAt", direction: "desc" }],
    },
    600
  );

  if (existing.length > 0) {
    const rec = existing[0];
    const fields: any = rec.fields;

    if (fields?.status === "approved") {
      return NextResponse.json({ request: { recordId: rec.id, ...rec.fields } });
    }

    noteCall(ACCESS_REQUESTS_TABLE);

    const updated = await base(ACCESS_REQUESTS_TABLE).update([
      {
        id: rec.id,
        fields: {
          status: "pending",
          message,
          reviewNotes: "",
          reviewedAt: null as any,
        },
      },
    ]);

    try {
      invalidateTable(ACCESS_REQUESTS_TABLE);
    } catch (e) {
      console.warn("Failed to invalidate access requests cache", e);
    }

    return NextResponse.json({
      request: { recordId: updated[0].id, ...updated[0].fields },
    });
  }

  // Create new request
  noteCall(ACCESS_REQUESTS_TABLE);

  const created = await base(ACCESS_REQUESTS_TABLE).create([
    {
      fields: {
        clubId,
        requesterUserId: auth.userId,
        requesterEmail: (session as any)?.user?.email ?? "",
        message,
        status: "pending",
        reviewNotes: "",
        reviewedAt: null as any,
      },
    },
  ]);

  try {
    invalidateTable(ACCESS_REQUESTS_TABLE);
  } catch (e) {
    console.warn("Failed to invalidate access requests cache", e);
  }

  // Notify recipients by email
  try {
    const recipients = ["communityrag-group@ucsc.edu"];
    console.log(`access-requests: notify recipients=${recipients}`);

    const requester = (session as any)?.user?.email ?? auth.userId;
    const subj = `Access request: ${clubId} by ${requester}`;
    const text = `User ${requester} requested access to club ${clubId}.

Message: ${message || "(none)"}

View access requests in the admin panel.`;

    try {
      const sent = await sendMail({ to: recipients, subject: subj, text }).catch((e) => {
        console.warn("sendMail failed", e);
        return false;
      });
      console.log("access-requests: sendMail result=", sent);
    } catch (e) {
      console.warn("access-requests: sendMail threw", e);
    }
  } catch (e) {
    console.warn("Failed to notify recipients of access request", e);
  }

  return NextResponse.json({
    request: { recordId: created[0].id, ...created[0].fields },
  });
}

