# Airtable Configuration

This document captures the Airtable table name overrides and the minimum field set referenced by the codebase.

If you rename tables or fields, you must update the matching API routes and UI code.

## Table Name Overrides

Set these in `.env.local` only if your Airtable base uses different table names:

- `AIRTABLE_CLUBS_TABLE` (default: `Clubs`)
- `AIRTABLE_CLUB_MEMBERS_TABLE` (default: `ClubMembers`)
- `AIRTABLE_MEMBERS_TABLE` (default: `ClubMembers`)
- `AIRTABLE_ACCESS_REQUESTS_TABLE` (default: `AccessRequests`)
- `AIRTABLE_REQUESTS_TABLE` (default: `AccessRequests`)
- `AIRTABLE_USERS_TABLE` (default: `Users`)
- `AIRTABLE_EVENTS_TABLE` (default: `Events`)

## Required Tables And Fields

**Clubs Table**

- `clubId` (text, UUID written by the app)
- `name` (text)
- `description` (long text)
- `clubIcebreakers` (long text, optional)
- `communityType` (multi-select, optional)
- `communityStatus` (multi-select, should include `Verified` when approved)
- `contactName` (text)
- `contactEmail` (email)
- `calendarUrl` (url, optional)
- `discordUrl` (url, optional)
- `websiteUrl` (url, optional)
- `instagramUrl` (url, optional)
- `linkedinUrl` (url, optional)
- `status` (single select: `pending`, `approved`, `rejected`)
- `submittedAt` (date/time)
- `reviewedAt` (date/time, nullable)
- `reviewNotes` (long text)
- `updatedAt` (date/time)


**ClubMembers Table**

- `clubId` (text)
- `userId` (text)
- `memberRole` (single select: `leader`, `admin`)
- `createdAt` (date/time)
- `name` (text, optional)

**AccessRequests Table**

- `clubId` (text)
- `requesterUserId` (text)
- `requesterEmail` (email)
- `message` (long text, optional)
- `status` (single select: `pending`, `approved`, `rejected`)
- `reviewNotes` (long text)
- `reviewedAt` (date/time, nullable)
- `createdAt` (date/time)
- `clubName` (text, optional)

**Users Table**

- `userId` (text)
- `email` (email)
- `role` (single select: `leader`, `admin`)
- `passwordHash` (text, only used by `/api/signup`)

**Events Table**

- `clubId` (text)
- `eventTitle` (text)
- `name` (text, set to the same value as `eventTitle`)
- `eventDate` (date or date/time)
- `eventLocation` (text, optional)
- `eventDescription` (long text, optional)
- `iceBreakers` (long text, optional)
