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

    const json = await req.json()
    const { paymentAmount, paymentModeId } = json

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.reservationId },
      include: {
        roomServices: true,
        payments: true,
      },
    })

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 })
    }

    if (reservation.status !== "CHECKED_IN") {
      return new NextResponse("Reservation must be checked in to proceed with checkout", { status: 400 })
    }

    // Create final bill
    const bill = await prisma.bill.create({
      data: {
        reservationId: reservation.id,
        billNumber: `BILL-${Date.now()}`,
        roomCharges: reservation.roomCharges,
        extraBedCharges: reservation.extraBedCharges,
        serviceCharges: reservation.serviceCharges,
        totalAmount: reservation.totalAmount,
        paidAmount: reservation.advanceAmount,
        pendingAmount: reservation.pendingAmount,
        status: paymentAmount >= reservation.pendingAmount ? "PAID" : "PARTIALLY_PAID",
      },
    })

    // Create payment record for the settlement
    if (paymentAmount > 0) {
      await prisma.payment.create({
        data: {
          billId: bill.id,
          amount: paymentAmount,
          paymentType: "SETTLEMENT",
          status: "COMPLETED",
          receiptNumber: `SET-${Date.now()}`,
          reservationId: reservation.id,
          userId: session.user.id,
          paymentModeId,
        },
      })
    }

    // Update reservation status and pending amount
    const updatedReservation = await prisma.reservation.update({
      where: { id: params.reservationId },
      data: {
        status: "CHECKED_OUT",
        pendingAmount: Math.max(0, reservation.pendingAmount - paymentAmount),
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        roomServices: {
          include: {
            service: true,
          },
        },
        payments: true,
        bills: true,
      },
    })

    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error("[RESERVATION_CHECKOUT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
