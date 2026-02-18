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
export const EVENTS_TABLE = process.env.AIRTABLE_EVENTS_TABLE ?? "Events";

type CacheEntry = { expires: number; data: any };

const cache = new Map<string, CacheEntry>();

function makeKey(table: string, params: any) {
	return `${table}:${JSON.stringify(params ?? {})}`;
}

// Simple in-memory stats for instrumentation
export const airtableStats: { calls: number; perTable: Record<string, number> } = {
	calls: 0,
	perTable: {},
};

// Increment upstream Airtable counter and log
export function noteCall(table?: string) {
	airtableStats.calls += 1;
	if (table) airtableStats.perTable[table] = (airtableStats.perTable[table] || 0) + 1;
	console.log(`AIRTABLE CALL +1 table=${table ?? "<unknown>"} total=${airtableStats.calls}`);
}

let forceNoCache = false;
export function setForceNoCache(v: boolean) {
	forceNoCache = !!v;
}

export function resetStats() {
	airtableStats.calls = 0;
	airtableStats.perTable = {};
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
	if (!forceNoCache && entry && entry.expires > now) {
		console.log(`CACHE HIT table=${table} key=${key} — HIT`);
		return entry.data;
	}

	// cache miss -> call Airtable
	noteCall(table);
	const records = await base(table).select(selectOptions).firstPage();
	const data = records.map((r: any) => ({ id: r.id, fields: r.fields }));
	if (!forceNoCache) cache.set(key, { expires: now + ttlSeconds * 1000, data });
	return data;
}

export async function cachedCount(table: string, selectOptions: any = {}, ttlSeconds = 10) {
	const key = makeKey(table, { method: "count", selectOptions });
	const now = Date.now();
	const entry = cache.get(key);
	if (!forceNoCache && entry && entry.expires > now) {
		console.log(`CACHE HIT table=${table} key=${key} — HIT`);
		return entry.data as number;
	}

	noteCall(table);
	const records = await base(table).select(selectOptions).firstPage();
	const count = records.length;
	if (!forceNoCache) cache.set(key, { expires: now + ttlSeconds * 1000, data: count });
	return count;
}

export async function cachedAll(
	table: string,
	selectOptions: any = {},
	ttlSeconds = 15,
	cacheKeyExtra?: any
) {
	const key = makeKey(table, { method: "all", selectOptions, cacheKeyExtra });
	const now = Date.now();
	const entry = cache.get(key);
	if (!forceNoCache && entry && entry.expires > now) {
		console.log(`CACHE HIT table=${table} key=${key} — HIT`);
		return entry.data;
	}

	noteCall(table);
	const records = await base(table).select(selectOptions).all();
	const data = records.map((r: any) => ({ id: r.id, fields: r.fields }));
	if (!forceNoCache) cache.set(key, { expires: now + ttlSeconds * 1000, data });
	return data;
}

export async function cachedFind(table: string, id: string, ttlSeconds = 30) {
	const key = makeKey(table, { method: "find", id });
	const now = Date.now();
	const entry = cache.get(key);
	if (!forceNoCache && entry && entry.expires > now) {
		console.log(`CACHE HIT table=${table} key=${key} — HIT`);
		return entry.data;
	}

	noteCall(table);
	const record = await base(table).find(id);
	const data = { id: record.id, fields: record.fields };
	if (!forceNoCache) cache.set(key, { expires: now + ttlSeconds * 1000, data });
	return data;
}
