import { PrismaClient } from "@prisma/client";
import {
  base,
  CLUBS_TABLE,
  USERS_TABLE,
  ACCESS_REQUESTS_TABLE,
  CLUB_MEMBERS_TABLE,
  EVENTS_TABLE,
} from "./lib/airtable";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function migrate() {
  console.log("Starting Migration...");

  // 1. Migrate Users
  console.log("Fetching users from Airtable...");
  const airtableUsers = await base(USERS_TABLE).select().all();

  for (const record of airtableUsers) {
    const fields = record.fields;
    await prisma.user.upsert({
      where: { email: String(fields.email).toLowerCase().trim() },
      update: {},
      create: {
        id: String(fields.userId),
        email: String(fields.email).toLowerCase().trim(),
        role: String(fields.role || "leader"),
      },
    });
  }
  console.log(`Success! Migrated ${airtableUsers.length} users.`);

  // 2. Migrate Clubs
  console.log("Fetching clubs from Airtable...");
  const airtableClubs = await base(CLUBS_TABLE).select().all();

  for (const record of airtableClubs) {
    const fields = record.fields as any;

    const providedClubId = fields.clubId || fields.clubID;

    // Helper function to safely handle Airtable dates
    const parseDate = (dateValue: any) => {
      if (!dateValue) return undefined;
      const d = new Date(dateValue);
      return isNaN(d.getTime()) ? undefined : d;
    };

    await prisma.club.upsert({
      where: { airtableId: record.id },
      update: {},
      create: {
        id: providedClubId ? String(providedClubId) : undefined,
        airtableId: record.id,
        name: String(fields.name || "Unnamed Club"),
        communityStatus: Array.isArray(fields.communityStatus)
          ? fields.communityStatus[0].toLowerCase()
          : "unofficial",
        communityType: Array.isArray(fields.communityType)
          ? fields.communityType[0].replace(/[\s\/&-]+/g, "_")
          : "Other",
        description: fields.description || "",
        contactName: fields.contactName || "",
        contactEmail: fields.contactEmail || "",
        calendarUrl: fields.calendarUrl || "",
        discordUrl: fields.discordUrl || null,
        websiteUrl: fields.websiteUrl || null,
        instagramUrl: fields.instagramUrl || null,
        linkedinUrl: fields.linkedinUrl || null,
        clubIcebreakers: fields.clubIcebreakers || "",
        status: (fields.status?.toLowerCase() === "approved"
          ? "approved"
          : "pending") as any,
        submittedAt: parseDate(fields.submittedAt),
        reviewedAt: parseDate(fields.reviewedAt),
        reviewNotes: fields.reviewNotes || "",
      },
    });
  }
  console.log(`Success! Migrated ${airtableClubs.length} clubs.`);

  // 3. Migrate Club Memberships
  console.log("Fetching memberships from Airtable...");
  const airtableMembers = await base(CLUB_MEMBERS_TABLE).select().all();

  let successCount = 0;
  let failCount = 0;

  for (const record of airtableMembers) {
    const fields = record.fields as any;

    const rawUserId = fields.userId;
    const rawClubId = fields.clubId;

    if (!rawUserId || !rawClubId) {
      console.warn(
        `Warning! Skipped Airtable Record ${record.id}: Missing userId or clubId in row.`,
      );
      failCount++;
      continue;
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: String(rawUserId) },
    });

    const dbClub = await prisma.club.findUnique({
      where: { id: String(rawClubId) },
    });

    if (dbUser && dbClub) {
      await prisma.clubMember.upsert({
        where: {
          userId_clubId: { userId: dbUser.id, clubId: dbClub.id },
        },
        update: {
          name: fields.name || "Unknown Member",
          memberRole: fields.memberRole === "admin" ? "admin" : "leader",
        },
        create: {
          userId: dbUser.id,
          clubId: dbClub.id,
          name: fields.name || "Unknown Member",
          memberRole: fields.memberRole === "admin" ? "admin" : "leader",
        },
      });
      successCount++;
    } else {
      console.warn(
        `Error: Failed to insert membership for ${fields.name || "Unknown"}:`,
      );
      if (!dbUser)
        console.warn(`   -> User not found in Postgres for UUID: ${rawUserId}`);
      if (!dbClub)
        console.warn(`   -> Club not found in Postgres for UUID: ${rawClubId}`);
      failCount++;
    }
  }

  console.log(`Successfully migrated ${successCount} memberships.`);
  if (failCount > 0) {
    console.log(
      `Failed to migrate ${failCount} memberships. Check the logs above.`,
    );
  }

  // 4. Migrate Access Requests
  console.log("Fetching access requests from Airtable...");
  const airtableRequests = await base(ACCESS_REQUESTS_TABLE).select().all();

  let savedCount = 0;

  for (const record of airtableRequests) {
    const fields = record.fields as any;

    const rawClubId = Array.isArray(fields.clubId)
      ? fields.clubId[0]
      : fields.clubId;
    const rawUserId = Array.isArray(fields.requesterUserId)
      ? fields.requesterUserId[0]
      : fields.requesterUserId;

    const dbUser = await prisma.user.findUnique({
      where: { id: String(rawUserId).trim() },
    });

    const dbClub = await prisma.club.findUnique({
      where: { id: String(rawClubId).trim() },
    });

    if (dbUser && dbClub) {
      await prisma.accessRequest.create({
        data: {
          id: crypto.randomUUID(),
          requesterUserId: dbUser.id,
          clubId: dbClub.id,
          requesterEmail: dbUser.email,
          message: String(fields.message || ""),
          status: (fields.status?.toLowerCase() || "pending") as any,
          reviewNotes: fields.reviewNotes || "",
          createdAt: fields.createdAt ? new Date(fields.createdAt) : new Date(),
        },
      });
      savedCount++;
    } else {
      console.warn(
        `Skipping request ${record.id}: User Found: ${!!dbUser}, Club Found: ${!!dbClub}`,
      );
      console.warn(
        `Looking for User ID: "${fields.requesterUserId}" and Club Airtable ID: "${fields.clubId}"`,
      );
    }
  }
  console.log(
    `Successfully saved ${savedCount} out of ${airtableRequests.length} requests.`,
  );

  // 5. Migrate Club Events
  console.log("Fetching events from Airtable...");
  const airtableEvents = await base(EVENTS_TABLE).select().all();

  let eventSuccessCount = 0;
  let eventFailCount = 0;

  for (const record of airtableEvents) {
    const fields = record.fields as any;

    const rawClubId = Array.isArray(fields.clubId)
      ? fields.clubId[0]
      : fields.clubId;
    const rawOwnerId = Array.isArray(fields.ownerUserId)
      ? fields.ownerUserId[0]
      : fields.ownerUserId;

    const rawEventId = fields.eventId || fields.id;

    if (!rawClubId || !rawOwnerId) {
      console.warn(
        `Skipped Event Record ${record.id}: Missing clubId or ownerUserId in Airtable row.`,
      );
      eventFailCount++;
      continue;
    }

    const dbClub = await prisma.club.findUnique({
      where: { id: String(rawClubId) },
    });

    const dbOwner = await prisma.user.findUnique({
      where: { id: String(rawOwnerId) },
    });

    if (dbClub && dbOwner) {
      try {
        await prisma.clubEvent.create({
          data: {
            id: rawEventId ? String(rawEventId) : undefined,

            clubId: dbClub.id,
            ownerUserId: dbOwner.id,

            name: fields.name || "Unnamed Event",
            eventTitle: fields.eventTitle || fields.name || "Untitled Event",

            eventDate: fields.eventDate
              ? new Date(fields.eventDate)
              : new Date(),

            eventLocation: fields.eventLocation || "TBD",
            eventDescription: fields.eventDescription || "",
            iceBreakers: fields.iceBreakers || "",
            channelId: fields.channelId || null,
            createdAt: fields.createdAt
              ? new Date(fields.createdAt)
              : undefined,
          },
        });
        eventSuccessCount++;
      } catch (error) {
        console.error(
          `Prisma Error inserting event ${fields.eventTitle || fields.name}:`,
          error,
        );
        eventFailCount++;
      }
    } else {
      console.warn(
        `Failed to insert event for ${fields.eventTitle || fields.name || "Unknown"}:`,
      );
      if (!dbClub)
        console.warn(`   -> Club not found in Postgres for UUID: ${rawClubId}`);
      if (!dbOwner)
        console.warn(
          `   -> Owner not found in Postgres for UUID: ${rawOwnerId}`,
        );
      eventFailCount++;
    }
  }

  console.log(`Successfully migrated ${eventSuccessCount} events.`);
  if (eventFailCount > 0) {
    console.log(
      `Failed to migrate ${eventFailCount} events. Check the logs above.`,
    );
  }

  console.log("Migration Complete!");
}

migrate()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
