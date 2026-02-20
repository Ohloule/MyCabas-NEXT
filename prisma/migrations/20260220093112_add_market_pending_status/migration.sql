-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('ACTIVE', 'PENDING', 'REJECTED');

-- AlterTable
ALTER TABLE "markets" ADD COLUMN     "status" "MarketStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "submittedByVendorId" TEXT;

-- CreateIndex
CREATE INDEX "markets_status_idx" ON "markets"("status");

-- AddForeignKey
ALTER TABLE "markets" ADD CONSTRAINT "markets_submittedByVendorId_fkey" FOREIGN KEY ("submittedByVendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
