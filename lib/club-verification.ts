import { CLUBS_TABLE, base, cachedFirstPage, invalidateTable, noteCall } from "@/lib/airtable";

export async function markClubVerified(clubId: string) {
  const cid = String(clubId ?? "").trim();
  if (!cid) return;

  const clubs = await cachedFirstPage(
    CLUBS_TABLE,
    { maxRecords: 1, filterByFormula: `{clubId}="${cid}"` },
    2
  );
  const club = clubs?.[0];
  if (!club) return;

  const fields = (club.fields ?? {}) as Record<string, unknown>;
  const current = String(fields.Verified ?? fields.verified ?? "").trim().toLowerCase();
  if (current === "verified") return;

  noteCall(CLUBS_TABLE);
  await base(CLUBS_TABLE).update([
    {
      id: club.id,
      fields: { Verified: "Verified" },
    },
  ]);

  try {
    invalidateTable(CLUBS_TABLE);
  } catch (e) {
    console.warn("Failed to invalidate clubs cache after verification update", e);
  }
}
