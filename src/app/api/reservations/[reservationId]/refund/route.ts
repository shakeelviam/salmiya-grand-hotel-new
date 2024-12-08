import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { nanoid } from "nanoid"

export async function POST(
  req: Request,
  { params }: { params: { reservationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { reservationId } = params

    // Get the reservation with payments
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        payments: {
          where: { status: "COMPLETED" },
        },
        roomType: true,
      },
    })

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 })
    }

    if (reservation.status !== "CONFIRMED") {
      return new NextResponse("Can only refund confirmed reservations", {
        status: 400,
      })
    }

    // Calculate total paid amount
    const totalPaid = reservation.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    )

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      let refundPayment = null;
      
      if (totalPaid > 0) {
        // Create refund record
        refundPayment = await tx.payment.create({
          data: {
            amount: -totalPaid, // Negative amount indicates refund
            reservationId: reservationId,
            userId: session.user.id,
            status: "COMPLETED",
            paymentModeId: "REFUND", // Make sure this exists in your payment modes
            receiptNumber: `REF-${nanoid(8).toUpperCase()}`,
            notes: "Reservation cancelled with refund",
          },
        })
      }

      // Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          notes: `${reservation.notes || ""}\nReservation cancelled with refund of ${totalPaid}`,
        },
        include: {
          roomType: true,
          payments: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return {
        reservation: updatedReservation,
        refundPayment,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[RESERVATION_REFUND]", error)
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error", 
      { status: 500 }
    )
  }
}
