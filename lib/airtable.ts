// lib/airtable.ts
import Airtable from "airtable";

const apiKey = process.env.AIRTABLE_API_KEY!;
const baseId = process.env.AIRTABLE_BASE_ID!;

export const base = new Airtable({ apiKey }).base(baseId);

// Table names (must match Airtable table names exactly)
export const CLUBS_TABLE = process.env.AIRTABLE_CLUBS_TABLE ?? "Clubs";
export const CLUB_MEMBERS_TABLE = process.env.AIRTABLE_CLUB_MEMBERS_TABLE ?? "ClubMembers";
export const ACCESS_REQUESTS_TABLE = process.env.AIRTABLE_ACCESS_REQUESTS_TABLE ?? "AccessRequests";
export const USERS_TABLE = process.env.AIRTABLE_USERS_TABLE ?? "Users";