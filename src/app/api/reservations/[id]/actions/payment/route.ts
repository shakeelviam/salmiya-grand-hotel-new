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
    const { amount, paymentModeId } = body

    // Get the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.reservationId },
    })

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 })
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount,
        paymentModeId,
        reservationId: params.reservationId,
        userId: session.user.id,
        status: "COMPLETED",
      },
    })

    // Update reservation status if this is the first payment
    if (reservation.status === "RESERVED_UNPAID") {
      await prisma.reservation.update({
        where: { id: params.reservationId },
        data: { status: "CONFIRMED" },
      })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error("[RESERVATION_PAYMENT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
