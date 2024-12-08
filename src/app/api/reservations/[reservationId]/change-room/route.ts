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
    const { newRoomId, reason } = body
    const { reservationId } = params

    // Get the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { room: true },
    })

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 })
    }

    if (reservation.status !== "CHECKED_IN") {
      return new NextResponse("Can only change room for checked-in reservations", {
        status: 400,
      })
    }

    // Check if new room is available
    const newRoom = await prisma.room.findUnique({
      where: { id: newRoomId },
    })

    if (!newRoom || !newRoom.isAvailable) {
      return new NextResponse("New room is not available", { status: 400 })
    }

    // Make old room available and new room unavailable
    await prisma.$transaction([
      prisma.room.update({
        where: { id: reservation.room.id },
        data: { isAvailable: true },
      }),
      prisma.room.update({
        where: { id: newRoomId },
        data: { isAvailable: false },
      }),
    ])

    // Update reservation
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        room: {
          connect: { id: newRoomId }
        },
        notes: `${reservation.notes || ""}
Room changed from ${reservation.room?.number} to ${newRoom.number}. Reason: ${reason}`,
      },
    })

    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error("[RESERVATION_CHANGE_ROOM]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
