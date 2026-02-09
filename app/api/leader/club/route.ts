import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { base, CLUBS_TABLE, CLUB_MEMBERS_TABLE, cachedFirstPage, invalidateTable, noteCall } from "@/lib/airtable";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "leader" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const records = await cachedFirstPage(
    CLUBS_TABLE,
    { maxRecords: 1, filterByFormula: `{ownerUserId} = "${userId}"` },
    600,
    { scope: "leader", allowStale: true }
  );

  if (!records || records.length === 0) return NextResponse.json({ club: null });

  return NextResponse.json({ club: { recordId: records[0].id, ...records[0].fields } });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session as any)?.userId;
    const role = (session as any)?.role;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (role !== "leader" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const basePayload = {
      ownerUserId: userId, // enforced server-side
      name: String(body.name ?? "").trim(),
      description: String(body.description ?? "").trim(),
      contactName: String(body.contactName ?? "").trim(),
      contactEmail: String(body.contactEmail ?? "").trim(),
      category: String(body.category ?? "").trim(),
      calendarUrl: String(body.calendarUrl ?? "").trim(),
      discordUrl: String(body.discordUrl ?? "").trim(),
      websiteUrl: String(body.websiteUrl ?? "").trim(),
      instagramUrl: String(body.instagramUrl ?? "").trim(),
      linkedinUrl: String(body.linkedinUrl ?? "").trim(),
      updatedAt: new Date().toISOString(),
    };

    if (!basePayload.name) {
      return NextResponse.json({ error: "Club name is required." }, { status: 400 });
    }

    const existing = await cachedFirstPage(
      CLUBS_TABLE,
      { maxRecords: 1, filterByFormula: `{ownerUserId} = "${userId}"` },
      600,
      { scope: "leader", allowStale: true }
    );

    const nowIso = new Date().toISOString();

    if (existing.length === 0) {
      const clubId = crypto.randomUUID();

      const payload = {
        clubId,
        ...basePayload,
        status: "pending",
        submittedAt: nowIso,
        reviewNotes: "",

        // IMPORTANT:
        // do NOT set reviewedAt here (date fields cannot be "")
        // reviewedAt is admin-only and should only be set on approve/reject
      };

      noteCall(CLUBS_TABLE);
      let created: any;
      try {
        created = await base(CLUBS_TABLE).create([{ fields: payload }]);
      } catch (err: any) {
        const msg = String(err?.message ?? "");
        if (msg.includes("Unknown field") || msg.includes("Unknown field name")) {
          const fallback = { ...payload };
          delete (fallback as any).category;
          created = await base(CLUBS_TABLE).create([{ fields: fallback }]);
        } else {
          throw err;
        }
      }

      // Add membership so creator can manage this club
      noteCall(CLUB_MEMBERS_TABLE);
      await base(CLUB_MEMBERS_TABLE).create([
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
        invalidateTable(CLUBS_TABLE, "leader");
        invalidateTable(CLUB_MEMBERS_TABLE, "leader");
        invalidateTable(CLUBS_TABLE, "clubs");
        invalidateTable(CLUBS_TABLE, "admin");
      } catch (e) {
        console.warn("Failed to invalidate clubs cache after create", e);
      }

      const cf = created[0].fields as any;
      return NextResponse.json({ club: { recordId: created[0].id, ...cf, category: cf.Category ?? cf.category } });
    } else {
      const recId = existing[0].id;
      const existingFields = existing[0].fields as any;

      const nextStatus = role === "admin" ? (existingFields.status ?? "approved") : "pending";

      const payload: any = {
        ...basePayload,
        status: nextStatus,
        submittedAt: nextStatus === "pending" ? nowIso : existingFields.submittedAt,
      };

      // Optional: if leader edits, clear previous reviewedAt (ADMIN-only behavior usually)
      // We intentionally do NOT touch reviewedAt here at all.

      noteCall(CLUBS_TABLE);
      let updated: any;
      try {
        updated = await base(CLUBS_TABLE).update([{ id: recId, fields: payload }]);
      } catch (err: any) {
        const msg = String(err?.message ?? "");
        if (msg.includes("Unknown field") || msg.includes("Unknown field name")) {
          const fallback = { ...payload };
          delete (fallback as any).category;
          updated = await base(CLUBS_TABLE).update([{ id: recId, fields: fallback }]);
        } else {
          throw err;
        }
      }

      try {
        invalidateTable(CLUBS_TABLE, "leader");
        invalidateTable(CLUBS_TABLE, "clubs");
        invalidateTable(CLUBS_TABLE, "admin");
      } catch (e) {
        console.warn("Failed to invalidate clubs cache after update", e);
      }

      const uf = updated[0].fields as any;
      return NextResponse.json({ club: { recordId: updated[0].id, ...uf, category: uf.Category ?? uf.category } });
    }
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
