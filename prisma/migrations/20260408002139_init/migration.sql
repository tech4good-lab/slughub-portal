/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Club` table. All the data in the column will be lost.
  - The `verified` column on the `Club` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Club" DROP COLUMN "updatedAt",
ADD COLUMN     "uupdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "verified",
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
