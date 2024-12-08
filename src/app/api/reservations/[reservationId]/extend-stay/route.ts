import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
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
    const { newCheckOutDate } = body

    // Get the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.reservationId },
    })

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 })
    }

    if (reservation.status !== "CHECKED_IN") {
      return new NextResponse("Can only extend stay for checked-in reservations", {
        status: 400,
      })
    }

    const newDate = new Date(newCheckOutDate)
    if (newDate <= reservation.checkOut) {
      return new NextResponse(
        "New check-out date must be after current check-out date",
        { status: 400 }
      )
    }

    // Calculate additional charges
    const additionalDays = Math.ceil(
      (newDate.getTime() - reservation.checkOut.getTime()) /
        (1000 * 60 * 60 * 24)
    )

    const roomType = await prisma.roomType.findUnique({
      where: { id: reservation.roomTypeId },
    })

    if (!roomType) {
      return new NextResponse("Room type not found", { status: 404 })
    }

    const additionalCharges =
      additionalDays * (roomType.basePrice + (reservation.extraBeds || 0) * roomType.extraBedPrice)

    // Update reservation
    const updatedReservation = await prisma.reservation.update({
      where: { id: params.reservationId },
      data: {
        checkOut: newDate,
        totalAmount: reservation.totalAmount + additionalCharges,
        pendingAmount: reservation.pendingAmount + additionalCharges,
        notes: `${
          reservation.notes || ""
        }\nStay extended by ${additionalDays} days. Additional charges: ${additionalCharges}`,
      },
    })

    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error("[RESERVATION_EXTEND_STAY]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
