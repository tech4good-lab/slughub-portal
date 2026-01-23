import { cachedFirstPage, cachedAll } from "@/lib/airtable";

const MEMBERS_TABLE = process.env.AIRTABLE_MEMBERS_TABLE || "ClubMembers";

export async function isClubLeaderMember(userId: string, clubId: string) {
  const records = await cachedFirstPage(
    MEMBERS_TABLE,
    { maxRecords: 1, filterByFormula: `AND({userId}="${userId}", {clubId}="${clubId}")` },
    300
  );

  if (!records || records.length === 0) return false;

  const memberRole = String((records[0].fields as any).memberRole ?? "").toLowerCase();
  return memberRole === "leader" || memberRole === "admin";
}

export async function getUserClubIds(userId: string) {
  const records = await cachedAll(MEMBERS_TABLE, { filterByFormula: `{userId}="${userId}"` }, 300);

  // only allow leader/admin memberships
  return (records || [])
    .map((r: any) => r.fields as any)
    .filter((f: any) => ["leader", "admin"].includes(String(f.memberRole ?? "").toLowerCase()))
    .map((f: any) => String(f.clubId))
    .filter(Boolean);
}
