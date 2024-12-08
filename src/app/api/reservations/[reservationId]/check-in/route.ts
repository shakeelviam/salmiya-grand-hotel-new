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
    const { roomId } = body
    const { reservationId } = params

    // Get the reservation with its current room type
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        roomType: true
      }
    })

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 })
    }

    if (reservation.status !== "CONFIRMED") {
      return new NextResponse("Reservation must be confirmed before check-in", {
        status: 400,
      })
    }

    // Check if room exists and matches the reservation's room type
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        roomType: true
      }
    })

    if (!room) {
      return new NextResponse("Room not found", { status: 404 })
    }

    if (room.roomTypeId !== reservation.roomTypeId) {
      return new NextResponse("Room type does not match reservation", { status: 400 })
    }

    if (!room.isAvailable) {
      return new NextResponse("Room is not available", { status: 400 })
    }

    // Check if room is already assigned to another active reservation
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        roomId: roomId,
        status: {
          in: ["CHECKED_IN", "CONFIRMED"]
        }
      }
    })

    if (existingReservation) {
      return new NextResponse("Room is already assigned to another reservation", { status: 400 })
    }

    // Use a transaction to ensure atomicity
    const updatedReservation = await prisma.$transaction(async (tx) => {
      // Update room availability
      await tx.room.update({
        where: { id: roomId },
        data: { isAvailable: false },
      })

      // Update reservation
      return tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: "CHECKED_IN",
          room: {
            connect: { id: roomId }
          },
          checkInTime: new Date(),
        },
        include: {
          room: {
            include: {
              roomType: true
            }
          },
          roomType: true,
          payments: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      })
    })

    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error("[RESERVATION_CHECK_IN]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
