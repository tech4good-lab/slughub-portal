/*
  Warnings:

  - The values [Verified,Unofficial] on the enum `ClubStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ClubStatus_new" AS ENUM ('verified', 'unofficial');
ALTER TABLE "public"."Club" ALTER COLUMN "communityStatus" DROP DEFAULT;
ALTER TABLE "Club" ALTER COLUMN "communityStatus" TYPE "ClubStatus_new" USING ("communityStatus"::text::"ClubStatus_new");
ALTER TYPE "ClubStatus" RENAME TO "ClubStatus_old";
ALTER TYPE "ClubStatus_new" RENAME TO "ClubStatus";
DROP TYPE "public"."ClubStatus_old";
ALTER TABLE "Club" ALTER COLUMN "communityStatus" SET DEFAULT 'unofficial';
COMMIT;

-- AlterTable
ALTER TABLE "Club" ALTER COLUMN "communityStatus" SET DEFAULT 'unofficial';
