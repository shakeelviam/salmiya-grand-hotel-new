import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { reservationId: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const reservation = await prisma.reservation.findUnique({
      where: {
        id: params.reservationId,
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

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 })
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error("[RESERVATION_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { reservationId: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const { status, checkIn, checkOut, roomId } = json

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.reservationId },
      include: {
        room: {
          include: { roomType: true },
        },
      },
    })

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 })
    }

    // Handle room change
    let updatedRoomCharges = reservation.roomCharges
    let updatedExtraBedCharges = reservation.extraBedCharges
    
    if (roomId && roomId !== reservation.roomId) {
      const newRoom = await prisma.room.findUnique({
        where: { id: roomId },
        include: { roomType: true },
      })

      if (!newRoom) {
        return new NextResponse("New room not found", { status: 404 })
      }

      const days = Math.ceil((new Date(checkOut || reservation.checkOut).getTime() - new Date(checkIn || reservation.checkIn).getTime()) / (1000 * 60 * 60 * 24))
      updatedRoomCharges = newRoom.roomType.basePrice * days
      updatedExtraBedCharges = reservation.extraBeds * newRoom.roomType.extraBedCharge * days
    }

    // Update reservation
    const updatedReservation = await prisma.reservation.update({
      where: { id: params.reservationId },
      data: {
        ...(status && { status }),
        ...(checkIn && { checkIn: new Date(checkIn) }),
        ...(checkOut && { checkOut: new Date(checkOut) }),
        ...(roomId && { roomId }),
        ...(roomId && {
          roomCharges: updatedRoomCharges,
          extraBedCharges: updatedExtraBedCharges,
          totalAmount: updatedRoomCharges + updatedExtraBedCharges + reservation.serviceCharges,
          pendingAmount: updatedRoomCharges + updatedExtraBedCharges + reservation.serviceCharges - reservation.advanceAmount,
        }),
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
    console.error("[RESERVATION_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { reservationId: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.reservationId },
    })

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 })
    }

    // Update reservation status to CANCELLED
    const cancelledReservation = await prisma.reservation.update({
      where: { id: params.reservationId },
      data: { status: "CANCELLED" },
    })

    return NextResponse.json(cancelledReservation)
  } catch (error) {
    console.error("[RESERVATION_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
