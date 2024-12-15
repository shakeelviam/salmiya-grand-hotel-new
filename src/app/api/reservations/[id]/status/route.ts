import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, ...data } = await request.json()
    const reservationId = params.id

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        room: true,
        roomType: true,
      },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      )
    }

    // Start a transaction to update reservation and create activity log
    const result = await prisma.$transaction(async (tx) => {
      // Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status,
          ...(status === "CHECKED_IN" && {
            roomId: data.roomId,
            checkInTime: new Date(),
          }),
          ...(status === "CHECKED_OUT" && {
            checkOutTime: new Date(),
            settledAmount: data.settleAmount,
          }),
          ...(status === "ROOM_CHANGED" && {
            roomId: data.newRoomId,
          }),
          ...(status === "EXTENDED" && {
            checkOut: data.newCheckOutDate,
          }),
          ...(status === "CANCELLED" && {
            cancellationReason: data.reason,
            cancellationDate: new Date(),
          }),
        },
        include: {
          room: true,
          roomType: true,
        },
      })

      // Create activity log
      await tx.activityLog.create({
        data: {
          reservationId,
          action: status,
          description: getActivityDescription(status, data),
          userId: session.user.id,
          timestamp: new Date(),
        },
      })

      return updatedReservation
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[RESERVATION_STATUS]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

function getActivityDescription(status: string, data: any): string {
  switch (status) {
    case "CHECKED_IN":
      return `Checked in to room ${data.roomId}`
    case "CHECKED_OUT":
      return `Checked out. Settled amount: ${data.settleAmount}`
    case "ROOM_CHANGED":
      return `Changed room to ${data.newRoomId}. Reason: ${data.reason}`
    case "EXTENDED":
      return `Extended stay until ${new Date(data.newCheckOutDate).toLocaleDateString()}`
    case "CANCELLED":
      return `Cancelled. Reason: ${data.reason}`
    default:
      return `Status changed to ${status}`
  }
}
