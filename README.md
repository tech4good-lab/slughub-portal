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
- A Google OAuth client for NextAuth (see Auth Setup)
- Supabase for database of clubs, events, club memebers, etc.
- Prisma for database integration and querying

## Scripts

- `npm run dev` Start the dev server
- `npm run build` Build for production
- `npm run start` Start the production server
- `npx prisma generate` Sync changes made in schema.prisma to the database
- `npm run lint` Run ESLint

## Environment Variables

Create or update `.env.local` with the following. The app will not work without google auth set up.

Required env:
- `GOOGLE_CLIENT_ID` Google OAuth client id
- `GOOGLE_CLIENT_SECRET` Google OAuth client secret
- `NEXTAUTH_URL` Base URL for NextAuth (ex: `http://localhost:3000`)
- `NEXTAUTH_SECRET` Secret for NextAuth (required in production, recommended in dev)
- `CRON_SECRET` Secret for vercel cron job that runs automatic email reminder every day at 9am

Email notification env (optional):

- `RESEND_API_KEY` Use Resend API
- `EMAIL_FROM` From address for emails

## Project Structure

- `app/` Next.js App Router pages and API routes
- `lib/` shared utilities (auth, permissions, mail)
- `prisma/` includes models for database
- `public/` static assets
- `scripts/` helper scripts for debugging

## Common Pages

- `app/page.tsx` Home / landing
- `app/directory` Community directory
- `app/leader/dashboard` Leader dashboard
- `app/admin/review` Community approvals
- `app/admin/access` Access requests

## Notes

- This repo uses Next.js App Router.
