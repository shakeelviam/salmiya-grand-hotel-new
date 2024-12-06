/*
  Warnings:

  - You are about to drop the column `category` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `MenuItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `notes` on the `Order` table. All the data in the column will be lost.
  - You are about to alter the column `totalAmount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `notes` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `guestId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `processedById` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `receiptUrl` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Payment` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `subject` on the `PermissionHistory` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `PermissionHistory` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `guestId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Reservation` table. All the data in the column will be lost.
  - You are about to alter the column `totalAmount` on the `Reservation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `floor` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `roomTypeId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `Guest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `MenuItem` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `userId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `method` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `reservationId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userId` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Reservation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `price` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_guestId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_processedById_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_reservationId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_guestId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_roomTypeId_fkey";

-- DropIndex
DROP INDEX "Payment_orderId_key";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "notes",
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "totalAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "notes",
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "guestId",
DROP COLUMN "notes",
DROP COLUMN "orderId",
DROP COLUMN "processedById",
DROP COLUMN "receiptUrl",
DROP COLUMN "transactionId",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "method",
ADD COLUMN     "method" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "reservationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PermissionHistory" DROP COLUMN "subject",
DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "details" TEXT;

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "createdById",
DROP COLUMN "guestId",
DROP COLUMN "notes",
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "totalAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "floor",
DROP COLUMN "roomTypeId",
DROP COLUMN "status",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- DropTable
DROP TABLE "Guest";

-- DropTable
DROP TABLE "RoomType";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "ReservationStatus";

-- DropEnum
DROP TYPE "RoomStatus";

-- CreateTable
CREATE TABLE "MenuCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuCategory_name_key" ON "MenuCategory"("name");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
