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

    // Get the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.reservationId },
    })

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 })
    }

    if (
      !["RESERVED_UNPAID", "CONFIRMED"].includes(reservation.status)
    ) {
      return new NextResponse("Cannot cancel reservation in current status", {
        status: 400,
      })
    }

    // Update reservation status
    const updatedReservation = await prisma.reservation.update({
      where: { id: params.reservationId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    })

    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error("[RESERVATION_CANCEL]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
