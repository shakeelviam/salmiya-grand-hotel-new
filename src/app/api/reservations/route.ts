import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { nanoid } from "nanoid"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const roomId = searchParams.get("roomId")

    const reservations = await prisma.reservation.findMany({
      where: {
        ...(status && { status }),
        ...(roomId && { roomId }),
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        roomType: true,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error("[RESERVATIONS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const { roomTypeId, guestId, checkIn, checkOut, adults, children, extraBeds, specialRequests, advanceAmount, paymentMode } = json

    // Get room type details for pricing
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
    })

    if (!roomType) {
      return new NextResponse("Room type not found", { status: 404 })
    }

    // Calculate charges
    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    const roomCharges = roomType.basePrice * days
    const extraBedCharges = (extraBeds || 0) * roomType.extraBedCharge * days
    const totalAmount = roomCharges + extraBedCharges

    // Determine reservation status based on advance payment
    const reservationStatus = advanceAmount > 0 ? "CONFIRMED" : "UNCONFIRMED"

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        id: nanoid(),
        roomTypeId,
        guestId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        adults,
        children,
        extraBeds,
        roomCharges,
        extraBedCharges,
        serviceCharges: 0,
        totalAmount,
        advanceAmount: advanceAmount || 0,
        pendingAmount: totalAmount - (advanceAmount || 0),
        status: reservationStatus,
        notes: specialRequests || "",
        userId: session.user.id,
      },
      include: {
        roomType: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // If advance payment was made, create a payment record
    if (advanceAmount > 0) {
      await prisma.payment.create({
        data: {
          amount: advanceAmount,
          paymentMode,
          reservationId: reservation.id,
          userId: session.user.id,
          type: "ADVANCE",
          status: "COMPLETED",
        },
      })

      // Create activity log
      await prisma.activityLog.create({
        data: {
          reservationId: reservation.id,
          userId: session.user.id,
          action: "PAYMENT",
          description: `Advance payment of ${advanceAmount} received via ${paymentMode}`,
        },
      })
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error("[RESERVATIONS_POST]", error)
    return new NextResponse(error instanceof Error ? error.message : "Internal error", { status: 500 })
  }
}
