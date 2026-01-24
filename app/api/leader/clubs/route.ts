import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { base, CLUBS_TABLE, cachedAll, invalidateTable, noteCall, USERS_TABLE } from "@/lib/airtable";
import { sendMail } from "@/lib/mail";
import { getUserClubIds } from "@/lib/permissions";

const MEMBERS_TABLE = process.env.AIRTABLE_MEMBERS_TABLE || "ClubMembers";

function orFormulaForClubIds(clubIds: string[]) {
  // OR({clubId}="a",{clubId}="b",...)
  const parts = clubIds.map((id) => `{clubId}="${id}"`);
  return `OR(${parts.join(",")})`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "leader" && role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clubIds = await getUserClubIds(userId);
  if (clubIds.length === 0) return NextResponse.json({ clubs: [] });

  const records = await cachedAll(
    CLUBS_TABLE,
    { filterByFormula: orFormulaForClubIds(clubIds), sort: [{ field: "updatedAt", direction: "desc" }] },
    600
  );

  const clubs = (records || []).map((r: any) => {
    const f = r.fields as any;
    return { recordId: r.id, ...f, category: f.Category ?? f.category };
  });
  return NextResponse.json({ clubs });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session as any)?.userId;
    const role = (session as any)?.role;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (role !== "leader" && role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const nowIso = new Date().toISOString();

    const clubId = crypto.randomUUID();

    const payload = {
      clubId,
      name: String(body.name ?? "").trim(),
      description: String(body.description ?? "").trim(),
      // Use Airtable field name 'category' (lowercase) as created in your table.
      category: String(body.category ?? "").trim(),
      contactName: String(body.contactName ?? "").trim(),
      contactEmail: String(body.contactEmail ?? "").trim(),
      calendarUrl: String(body.calendarUrl ?? "").trim(),
      discordUrl: String(body.discordUrl ?? "").trim(),
      websiteUrl: String(body.websiteUrl ?? "").trim(),
      instagramUrl: String(body.instagramUrl ?? "").trim(),
      linkedinUrl: String(body.linkedinUrl ?? "").trim(),
      updatedAt: nowIso,

      status: "pending",
      submittedAt: nowIso,
      reviewNotes: "",
    };

    if (!payload.name) {
      return NextResponse.json({ error: "Club name is required." }, { status: 400 });
    }

    noteCall(CLUBS_TABLE);
    let created: any;
    try {
      created = await base(CLUBS_TABLE).create([{ fields: payload }]);
    } catch (err: any) {
      const msg = String(err?.message ?? "");
      if (msg.includes("Unknown field") || msg.includes("Unknown field name")) {
        // Retry without the category field in case the Airtable table doesn't have that column yet.
        const fallback = { ...payload };
        delete (fallback as any).category;
        created = await base(CLUBS_TABLE).create([{ fields: fallback }]);
      } else {
        throw err;
      }
    }

    // Add membership so creator can manage this club
    noteCall(MEMBERS_TABLE);
    await base(MEMBERS_TABLE).create([
      {
        fields: {
          clubId,
          userId,
          memberRole: "leader",
          createdAt: nowIso,
        },
      },
    ]);

    try {
      invalidateTable(CLUBS_TABLE);
      invalidateTable(MEMBERS_TABLE);
    } catch (e) {
      console.warn("Failed to invalidate leader clubs cache", e);
    }

    // Notify admins by email (best-effort)
    try {
      const admins = await cachedAll(USERS_TABLE, { filterByFormula: `{role} = "admin"` }, 600);
      const adminEmails = (admins || []).map((r: any) => (r.fields as any)?.email).filter(Boolean);
      if (adminEmails.length > 0) {
        const subj = `New club request: ${payload.name}`;
        const body = `A new club was submitted by ${(session as any)?.user?.email ?? userId}.

Name: ${payload.name}
ClubId: ${clubId}
Contact: ${payload.contactName} <${payload.contactEmail}>

Review it in the admin panel.`;
        sendMail({ to: adminEmails, subject: subj, text: body }).catch((e) => console.warn("sendMail failed", e));
      }
    } catch (e) {
      console.warn("Failed to notify admins of new club", e);
    }

    const createdFields = created[0].fields as any;
    return NextResponse.json({ club: { recordId: created[0].id, ...createdFields, category: createdFields.Category ?? createdFields.category } });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
