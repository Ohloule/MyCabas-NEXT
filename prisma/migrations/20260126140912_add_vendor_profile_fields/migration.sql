-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'CHECK', 'TRANSFER');

-- CreateEnum
CREATE TYPE "VendorLabel" AS ENUM ('BIO', 'LOCAL', 'ARTISAN', 'FERMIER', 'AOC_AOP', 'LABEL_ROUGE', 'FAIR_TRADE');

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "email" TEXT,
ADD COLUMN     "labels" "VendorLabel"[],
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "paymentMethods" "PaymentMethod"[],
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "website" TEXT;
