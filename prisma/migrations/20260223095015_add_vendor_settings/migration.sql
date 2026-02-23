-- CreateTable
CREATE TABLE "vendor_settings" (
    "id" TEXT NOT NULL,
    "notifPush" BOOLEAN NOT NULL DEFAULT true,
    "notifEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifSms" BOOLEAN NOT NULL DEFAULT false,
    "autoConfirm" BOOLEAN NOT NULL DEFAULT false,
    "deadlineDaysBeforeDay" INTEGER NOT NULL DEFAULT 1,
    "deadlineHour" INTEGER NOT NULL DEFAULT 19,
    "deadlineMinute" INTEGER NOT NULL DEFAULT 0,
    "vacationMode" BOOLEAN NOT NULL DEFAULT false,
    "vacationStart" TIMESTAMP(3),
    "vacationEnd" TIMESTAMP(3),
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_settings_vendorId_key" ON "vendor_settings"("vendorId");

-- AddForeignKey
ALTER TABLE "vendor_settings" ADD CONSTRAINT "vendor_settings_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
