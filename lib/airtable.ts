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

type CacheEntry = { expires: number; data: any };

const cache = new Map<string, CacheEntry>();

function makeKey(table: string, params: any) {
	return `${table}:${JSON.stringify(params ?? {})}`;
}

export function invalidateTable(table?: string) {
	if (!table) {
		cache.clear();
		return;
	}
	for (const key of Array.from(cache.keys())) {
		if (key.startsWith(`${table}:`)) cache.delete(key);
	}
}

export async function cachedFirstPage(table: string, selectOptions: any = {}, ttlSeconds = 15) {
	const key = makeKey(table, { method: "firstPage", selectOptions });
	const now = Date.now();
	const entry = cache.get(key);
	if (entry && entry.expires > now) return entry.data;

	const records = await base(table).select(selectOptions).firstPage();
	const data = records.map((r: any) => ({ id: r.id, fields: r.fields }));
	cache.set(key, { expires: now + ttlSeconds * 1000, data });
	return data;
}

export async function cachedCount(table: string, selectOptions: any = {}, ttlSeconds = 10) {
	const key = makeKey(table, { method: "count", selectOptions });
	const now = Date.now();
	const entry = cache.get(key);
	if (entry && entry.expires > now) return entry.data as number;

	const records = await base(table).select(selectOptions).firstPage();
	const count = records.length;
	cache.set(key, { expires: now + ttlSeconds * 1000, data: count });
	return count;
}

export async function cachedAll(table: string, selectOptions: any = {}, ttlSeconds = 15) {
	const key = makeKey(table, { method: "all", selectOptions });
	const now = Date.now();
	const entry = cache.get(key);
	if (entry && entry.expires > now) return entry.data;

	const records = await base(table).select(selectOptions).all();
	const data = records.map((r: any) => ({ id: r.id, fields: r.fields }));
	cache.set(key, { expires: now + ttlSeconds * 1000, data });
	return data;
}

export async function cachedFind(table: string, id: string, ttlSeconds = 30) {
	const key = makeKey(table, { method: "find", id });
	const now = Date.now();
	const entry = cache.get(key);
	if (entry && entry.expires > now) return entry.data;

	const record = await base(table).find(id);
	const data = { id: record.id, fields: record.fields };
	cache.set(key, { expires: now + ttlSeconds * 1000, data });
	return data;
}