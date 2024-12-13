import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkPermission } from "@/lib/permissions";

export async function POST(
  request: Request,
  { params }: { params: { reservationId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(request, authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Check permissions
    const hasPermission = await checkPermission(session.user.id, "manage_reservations");
    if (!hasPermission) {
      return NextResponse.json(
        { message: "Permission denied. You cannot cancel reservations." },
        { status: 403 }
      );
    }

    const reservationId = params.reservationId;

    // Validate reservation exists and can be cancelled
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        room: true,
        payments: true
      }
    });

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found." },
        { status: 404 }
      );
    }

    if (reservation.status === "CANCELLED") {
      return NextResponse.json(
        { message: "Reservation is already cancelled." },
        { status: 400 }
      );
    }

    if (reservation.isCheckedIn || reservation.isCheckedOut) {
      return NextResponse.json(
        { message: "Cannot cancel a checked-in or checked-out reservation." },
        { status: 400 }
      );
    }

    // Calculate total paid amount for potential refund
    const totalPaid = reservation.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Start transaction to update reservation and create refund if needed
    const result = await prisma.$transaction(async (tx) => {
      // Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: "CANCELLED",
          cancelDate: new Date()
        }
      });

      // Update room status if room is assigned
      if (reservation.roomId) {
        await tx.room.update({
          where: { id: reservation.roomId },
          data: { status: "AVAILABLE" }
        });
      }

      // Create refund transaction if there are payments
      let refundTransaction = null;
      if (totalPaid > 0) {
        refundTransaction = await tx.payment.create({
          data: {
            amount: -totalPaid, // Negative amount indicates refund
            type: "REFUND",
            status: "COMPLETED",
            description: "Refund for cancelled reservation",
            reservation: { connect: { id: reservationId } }
          }
        });
      }

      return { updatedReservation, refundTransaction };
    });

    return NextResponse.json({
      message: "Reservation cancelled successfully",
      data: {
        reservation: result.updatedReservation,
        refund: result.refundTransaction,
        refundAmount: totalPaid
      }
    });

  } catch (error) {
    console.error("[RESERVATION_CANCEL]", error);
    return NextResponse.json(
      { message: "An error occurred while cancelling the reservation." },
      { status: 500 }
    );
  }
}
