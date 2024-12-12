import { PrismaClient } from '@prisma/client'
import { addHours } from 'date-fns'

const prisma = new PrismaClient()

async function checkNoShows() {
  try {
    // Get hotel settings
    const settings = await prisma.hotelSettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!settings) {
      console.error('No hotel settings found');
      return;
    }

    // Find all CONFIRMED reservations that are past their check-in time
    const noShowReservations = await prisma.reservation.findMany({
      where: {
        status: "CONFIRMED",
        checkInDate: {
          lt: addHours(new Date(), -settings.noShowHours)
        },
        isCheckedIn: false
      },
      include: {
        payments: true,
        room: true
      }
    });

    for (const reservation of noShowReservations) {
      // Calculate total paid amount
      const totalPaid = reservation.payments
        .filter(payment => payment.type === "PAYMENT" && payment.status === "COMPLETED")
        .reduce((sum, payment) => sum + payment.amount, 0);

      // Calculate refund amount based on settings
      const refundAmount = totalPaid * (settings.noShowRefundPercent / 100);
      const noShowFee = totalPaid - refundAmount;

      // Process in a transaction
      await prisma.$transaction(async (tx) => {
        // Update reservation status
        await tx.reservation.update({
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

        // Create refund record if applicable and if refund approval is required
        if (refundAmount > 0) {
          await tx.payment.create({
            data: {
              amount: -refundAmount,
              type: "REFUND",
              status: settings.refundApprovalRequired ? "PENDING" : "COMPLETED",
              description: "Automatic refund for no-show reservation",
              reservation: { connect: { id: reservation.id } }
            }
          });
        }

        // Log the action
        await tx.activityLog.create({
          data: {
            action: "NO_SHOW",
            description: `Reservation ${reservation.id} marked as no-show. No-show fee: ${noShowFee}, Refund amount: ${refundAmount}`,
            reservationId: reservation.id
          }
        });
      });

      console.log(`Processed no-show for reservation ${reservation.id}`);
    }

    console.log(`Processed ${noShowReservations.length} no-show reservations`);
  } catch (error) {
    console.error('Error processing no-shows:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkNoShows();
