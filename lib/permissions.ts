import { base } from "@/lib/airtable";

const MEMBERS_TABLE = process.env.AIRTABLE_MEMBERS_TABLE || "ClubMembers";

export async function isClubLeaderMember(userId: string, clubId: string) {
  const records = await base(MEMBERS_TABLE)
    .select({
      maxRecords: 1,
      filterByFormula: `AND({userId}="${userId}", {clubId}="${clubId}")`,
    })
    .firstPage();

  if (records.length === 0) return false;

  const memberRole = String((records[0].fields as any).memberRole ?? "").toLowerCase();
  return memberRole === "leader" || memberRole === "admin";
}

export async function getUserClubIds(userId: string) {
  const records = await base(MEMBERS_TABLE)
    .select({
      filterByFormula: `{userId}="${userId}"`,
    })
    .all();

  // only allow leader/admin memberships
  return records
    .map((r) => r.fields as any)
    .filter((f) => ["leader", "admin"].includes(String(f.memberRole ?? "").toLowerCase()))
    .map((f) => String(f.clubId))
    .filter(Boolean);
}
