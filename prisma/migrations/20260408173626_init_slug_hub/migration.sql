/*
  Warnings:

  - The `status` column on the `AccessRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `updatedAt` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `verification` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `Club` table. All the data in the column will be lost.
  - The `communityStatus` column on the `Club` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `communityType` column on the `Club` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ClubStatus" AS ENUM ('verified', 'unofficial');

-- CreateEnum
CREATE TYPE "CommType" AS ENUM ('Campus_Department_Program', 'Professional_and_Career', 'Performing_and_Visual_Arts', 'Cultural_and_Identity', 'Greek_letter', 'Academic', 'Sports_and_Recreation', 'Media_and_Broadcasting', 'Politics_and_Advocacy', 'Research', 'Other');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "AccessRequest" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Club" DROP COLUMN "updatedAt",
DROP COLUMN "verification",
DROP COLUMN "verified",
ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'pending',
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "communityStatus",
ADD COLUMN     "communityStatus" "ClubStatus" NOT NULL DEFAULT 'unofficial',
DROP COLUMN "communityType",
ADD COLUMN     "communityType" "CommType" NOT NULL DEFAULT 'Other';

-- DropEnum
DROP TYPE "RequestStatus";
