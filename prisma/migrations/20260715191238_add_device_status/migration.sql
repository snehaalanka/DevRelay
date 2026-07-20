-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "lastSeen" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'offline';
