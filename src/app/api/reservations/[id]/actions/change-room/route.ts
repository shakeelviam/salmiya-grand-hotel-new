import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { checkPermission } from "@/lib/permissions"

export async function POST(
  req: Request,
  { params }: { params: { reservationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check permissions
    const hasPermission = await checkPermission(session.user.id, "update", "reservations")
    if (!hasPermission) {
      return NextResponse.json(
        { message: "You don'"t have permission to change rooms." },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { newRoomId, reason } = body
    const { reservationId } = params

    // Get the reservation with current room and room type details
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        bills: {
          where: {
            status: "UNPAID",
          },
        },
      },
    })

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 })
    }

    if (reservation.status !== "CHECKED_IN") {
      return new NextResponse("Can only change room for checked-in reservations", {
        status: 400,
      })
    }

    // Get new room with its type details
    const newRoom = await prisma.room.findUnique({
      where: { id: newRoomId },
      include: {
        roomType: true,
      },
    })

    if (!newRoom || newRoom.status !== "AVAILABLE") {
      return new NextResponse("New room is not available", { status: 400 })
    }

    // Calculate remaining nights
    const now = new Date()
    const checkOut = new Date(reservation.checkOut)
    const remainingNights = Math.ceil((checkOut.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Calculate rate difference
    const oldRoomRate = reservation.room?.roomType.basePrice || 0
    const newRoomRate = newRoom.roomType.basePrice
    const rateDifference = newRoomRate - oldRoomRate
    const additionalCharge = rateDifference * remainingNights

    // Start a transaction to handle all updates
    await prisma.$transaction(async (tx) => {
      // Update room statuses
      await tx.room.update({
        where: { id: reservation.room?.id },
        data: { status: "AVAILABLE" },
      })

      await tx.room.update({
        where: { id: newRoomId },
        data: { status: "OCCUPIED" },
      })

      // Update reservation with new room and adjusted charges
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          roomId: newRoomId,
          roomCharges: {
            increment: additionalCharge > 0 ? additionalCharge : 0,
          },
          totalAmount: {
            increment: additionalCharge,
          },
          pendingAmount: {
            increment: additionalCharge,
          },
          status: "CHECKED_IN",
          activityLogs: {
            create: {
              action: "ROOM_CHANGE",
              description: `Room changed from ${reservation.room?.number} to ${newRoom.number}. Reason: ${reason}. Rate difference: ${additionalCharge}`,
            },
          },
        },
      })

      // Update or create bill for the rate difference
      if (additionalCharge !== 0) {
        const currentBill = reservation.bills[0]
        if (currentBill) {
          await tx.bill.update({
            where: { id: currentBill.id },
            data: {
              roomCharges: { increment: additionalCharge > 0 ? additionalCharge : 0 },
              totalAmount: { increment: additionalCharge },
              pendingAmount: { increment: additionalCharge },
            },
          })
        }
      }
    })

    // Fetch and return the updated reservation with new details
    const updatedReservationWithDetails = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        bills: true,
        activityLogs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    return NextResponse.json(updatedReservationWithDetails)
  } catch (error) {
    console.error("[RESERVATION_CHANGE_ROOM]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
