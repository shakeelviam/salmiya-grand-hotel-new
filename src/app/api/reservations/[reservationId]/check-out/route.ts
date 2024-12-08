import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function POST(
  req: Request,
  { params }: { params: { reservationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { settleAmount } = body

    // Get the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.reservationId },
      include: { room: true },
    })

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 })
    }

    if (reservation.status !== "CHECKED_IN") {
      return new NextResponse("Reservation must be checked in before check-out", {
        status: 400,
      })
    }

    // If there's a settlement amount, create a payment record
    if (settleAmount > 0) {
      await prisma.payment.create({
        data: {
          amount: settleAmount,
          reservationId: params.reservationId,
          userId: session.user.id,
          status: "COMPLETED",
        },
      })
    }

    // Make room available again
    if (reservation.roomId) {
      await prisma.room.update({
        where: { id: reservation.roomId },
        data: { isAvailable: true },
      })
    }

    // Update reservation
    const updatedReservation = await prisma.reservation.update({
      where: { id: params.reservationId },
      data: {
        status: "COMPLETED",
        checkOutTime: new Date(),
      },
    })

    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error("[RESERVATION_CHECK_OUT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
