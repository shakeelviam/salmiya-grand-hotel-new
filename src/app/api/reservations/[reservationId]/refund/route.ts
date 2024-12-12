import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";

export async function POST(
  request: Request,
  { params }: { params: { reservationId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const reservationId = params.reservationId;

    // Get reservation with payments
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        payments: true
      }
    });

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found." },
        { status: 404 }
      );
    }

    // Special handling for NO_SHOW reservations
    if (reservation.status === "NO_SHOW" && reservation.requiresAdminRefund) {
      // Check if user has admin role
      const hasAdminPermission = await checkPermission(session.user.id, "admin");
      if (!hasAdminPermission) {
        return NextResponse.json(
          { message: "No-show refunds require admin approval." },
          { status: 403 }
        );
      }
    } else {
      // For non-NO_SHOW refunds, check regular permissions
      const hasPermission = await checkPermission(session.user.id, "manage_reservations");
      if (!hasPermission) {
        return NextResponse.json(
          { message: "Permission denied. You cannot process refunds." },
          { status: 403 }
        );
      }

      // Only allow refunds for specific statuses
      if (!["CONFIRMED", "CANCELLED", "NO_SHOW"].includes(reservation.status) || reservation.isCheckedIn) {
        return NextResponse.json(
          { message: "This reservation cannot be refunded." },
          { status: 400 }
        );
      }
    }

    // Calculate total paid amount (only consider PAYMENT type)
    const totalPaid = reservation.payments
      .filter(payment => payment.type === "PAYMENT" && payment.status === "COMPLETED")
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate total refunded amount (only consider REFUND type)
    const totalRefunded = reservation.payments
      .filter(payment => payment.type === "REFUND" && payment.status === "COMPLETED")
      .reduce((sum, payment) => sum + Math.abs(payment.amount), 0);

    const remainingAmount = totalPaid - totalRefunded;

    if (remainingAmount <= 0) {
      return NextResponse.json(
        { message: "No amount available for refund." },
        { status: 400 }
      );
    }

    // For NO_SHOW reservations, only refund 50% of the remaining amount
    const refundAmount = reservation.status === "NO_SHOW" 
      ? remainingAmount * 0.5 
      : remainingAmount;

    // Create refund transaction
    const refund = await prisma.payment.create({
      data: {
        amount: -refundAmount, // Negative amount indicates refund
        type: "REFUND",
        status: "COMPLETED",
        description: `Refund for ${reservation.status.toLowerCase()} reservation${reservation.status === "NO_SHOW" ? " (50% penalty)" : ""}`,
        processedBy: session.user.id,
        reservation: { connect: { id: reservationId } }
      }
    });

    // Update reservation status and clear admin refund flag if applicable
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: "REFUNDED",
        cancelDate: new Date(),
        cancelledBy: session.user.id,
        requiresAdminRefund: false
      }
    });

    return NextResponse.json({
      message: `Refund of ${refundAmount} processed successfully${reservation.status === "NO_SHOW" ? " (50% of original amount)" : ""}`,
      data: {
        refund,
        refundAmount,
        originalAmount: remainingAmount,
        wasNoShow: reservation.status === "NO_SHOW"
      }
    });

  } catch (error) {
    console.error("[RESERVATION_REFUND]", error);
    return NextResponse.json(
      { message: "An error occurred while processing the refund." },
      { status: 500 }
    );
  }
}
