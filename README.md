<<<<<<< HEAD
# SlugHub Portal

SlugHub Portal is a Next.js app for UCSC community leaders to manage and publish their organization’s profile, events, and contact info in the SlugHub directory.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. For local dev, create or update `.env.local` (see Environment Variables below).

3. Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Prerequisites

- Node.js (LTS recommended)
- npm (bundled with Node.js)
- An Airtable base with the required tables and fields (see `docs/airtable-config.md`)
- A Google OAuth client for NextAuth (see Auth Setup)

## Scripts

- `npm run dev` Start the dev server
- `npm run build` Build for production
- `npm run start` Start the production server
- `npm run lint` Run ESLint

## Environment Variables

Create or update `.env.local` with the following. The app will not work without Airtable and google auth set up.

Required env:

- `AIRTABLE_API_KEY` Airtable API key
- `AIRTABLE_BASE_ID` Airtable base ID
- `GOOGLE_CLIENT_ID` Google OAuth client id
- `GOOGLE_CLIENT_SECRET` Google OAuth client secret
- `NEXTAUTH_URL` Base URL for NextAuth (ex: `http://localhost:3000`)
- `NEXTAUTH_SECRET` Secret for NextAuth (required in production, recommended in dev)

Email notification env (optional):

- `RESEND_API_KEY` Use Resend API
- `EMAIL_FROM` From address for emails

## Project Structure

- `app/` Next.js App Router pages and API routes
- `lib/` shared utilities (Airtable, auth, permissions, mail)
- `public/` static assets
- `scripts/` helper scripts for debugging

## Airtable Data Access

Airtable helpers are in `lib/airtable.ts` with basic caching. API routes found under `app/api/`.

## Auth Setup and Roles

Auth is handled by NextAuth with Google OAuth. Users are stored in Airtable and assigned a role (`leader` by default, `admin` for admin features). Roles are checked in admin routes and pages.

1. Create a Google OAuth app in Google Cloud Console.
2. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`, `https://portal.slughub.cc/api/auth/callback/google`.
3. Copy the client ID and client secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
4. If your OAuth app is in Testing, add your user emails as test users.

## Common Pages

- `app/page.tsx` Home / landing
- `app/directory` Community directory
- `app/leader/dashboard` Leader dashboard
- `app/admin/review` Community approvals
- `app/admin/access` Access requests

## Notes

- This repo uses Next.js App Router.
- If you change Airtable field names, check related API routes in `app/api/`.
=======

>>>>>>> 59c4ef1 (Create README.md)
