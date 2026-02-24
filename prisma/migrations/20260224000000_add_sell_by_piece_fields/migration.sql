-- AlterTable: add sell-by-piece fields to products
ALTER TABLE "products" ADD COLUMN "canSellByPiece" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN "approxWeightPerPiece" DOUBLE PRECISION;
ALTER TABLE "products" ADD COLUMN "pricePerPiece" DOUBLE PRECISION;
