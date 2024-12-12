import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addHours, isBefore } from "date-fns";

// Constants for business rules
const NO_SHOW_HOURS = 12; // Hours after check-in time to mark as no-show
const NO_SHOW_REFUND_PERCENTAGE = 0; // 0% refund for no-shows

export async function GET(request: Request) {
  try {
    // Verify cron secret to ensure only authorized calls
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find all CONFIRMED reservations that are past their check-in time by NO_SHOW_HOURS
    const noShowReservations = await prisma.reservation.findMany({
      where: {
        status: "CONFIRMED",
        checkInDate: {
          lt: addHours(new Date(), -NO_SHOW_HOURS)
        },
        isCheckedIn: false
      },
      include: {
        payments: true,
        room: true
      }
    });

    const updates = await Promise.all(
      noShowReservations.map(async (reservation) => {
        // Calculate total paid amount
        const totalPaid = reservation.payments
          .filter(payment => payment.type === "PAYMENT" && payment.status === "COMPLETED")
          .reduce((sum, payment) => sum + payment.amount, 0);

        // Calculate refund amount (if any)
        const refundAmount = totalPaid * (NO_SHOW_REFUND_PERCENTAGE / 100);
        const noShowFee = totalPaid - refundAmount;

        // Process in a transaction
        return await prisma.$transaction(async (tx) => {
          // Update reservation status
          const updatedReservation = await tx.reservation.update({
            where: { id: reservation.id },
            data: {
              status: "NO_SHOW",
              noShowDate: new Date(),
              noShowFee: noShowFee
            }
          });

          // Release the room
          await tx.room.update({
            where: { id: reservation.roomId },
            data: { status: "AVAILABLE" }
          });

          // Create refund record if applicable
          if (refundAmount > 0) {
            await tx.payment.create({
              data: {
                amount: -refundAmount,
                type: "REFUND",
                status: "PENDING",
                description: "Automatic refund for no-show reservation",
                reservation: { connect: { id: reservation.id } }
              }
            });
          }

          // Log the no-show event
          await tx.activityLog.create({
            data: {
              action: "NO_SHOW",
              description: `Reservation ${reservation.id} marked as no-show. No-show fee: ${noShowFee}, Refund amount: ${refundAmount}`,
              reservationId: reservation.id
            }
          });

          return {
            reservationId: reservation.id,
            status: "NO_SHOW",
            noShowFee,
            refundAmount,
            markedAt: new Date()
          };
        });
      })
    );

    return NextResponse.json({
      message: `Processed ${updates.length} no-show reservations`,
      data: updates
    });

  } catch (error) {
    console.error("[NO_SHOW_PROCESSING_ERROR]", error);
    return NextResponse.json(
      { message: "An error occurred while processing no-shows" },
      { status: 500 }
    );
  }
}
