/*
  Warnings:

  - Added the required column `updatedAt` to the `market_vendors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "market_vendors" ADD COLUMN     "days" "Day"[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
