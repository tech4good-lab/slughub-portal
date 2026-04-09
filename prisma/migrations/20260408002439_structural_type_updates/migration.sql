/*
  Warnings:

  - The `communityStatus` column on the `Club` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `communityType` column on the `Club` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Club" DROP COLUMN "communityStatus",
ADD COLUMN     "communityStatus" TEXT[],
DROP COLUMN "communityType",
ADD COLUMN     "communityType" TEXT[];
