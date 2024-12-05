-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "room_types" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
