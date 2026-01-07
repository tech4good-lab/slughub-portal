import Airtable from "airtable";

export const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY! });
export const base = airtable.base(process.env.AIRTABLE_BASE_ID!);

export const USERS_TABLE = process.env.AIRTABLE_USERS_TABLE || "Users";
export const CLUBS_TABLE = process.env.AIRTABLE_CLUBS_TABLE || "Clubs";
