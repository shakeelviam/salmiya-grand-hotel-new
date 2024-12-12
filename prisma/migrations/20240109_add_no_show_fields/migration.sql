-- Add new fields to Reservation
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "noShowDate" TIMESTAMP(3);
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "noShowFee" DECIMAL(65,30);

-- Create ActivityLog table
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reservationId" TEXT,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX "ActivityLog_reservationId_idx" ON "ActivityLog"("reservationId");

-- Add foreign key constraints
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_reservationId_fkey"
    FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
