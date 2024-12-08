import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const roomId = searchParams.get("roomId")
    const reservationId = searchParams.get("reservationId")

    const roomServices = await prisma.roomService.findMany({
      where: {
        ...(status && { status }),
        ...(roomId && { roomId }),
        ...(reservationId && { reservationId }),
      },
      include: {
        room: true,
        service: {
          include: {
            category: true,
          },
        },
        reservation: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(roomServices)
  } catch (error) {
    console.error("[ROOM_SERVICES_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const json = await req.json()
    const { roomId, reservationId, serviceId, quantity, notes } = json

    // Verify reservation exists and is checked in
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      )
    }

    if (reservation.status !== "CHECKED_IN") {
      return NextResponse.json(
        { error: "Room service can only be ordered for checked-in reservations" },
        { status: 400 }
      )
    }

    // Get service details for pricing
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    const amount = service.price * quantity

    // Create room service order
    const roomService = await prisma.roomService.create({
      data: {
        roomId,
        reservationId,
        serviceId,
        quantity,
        notes,
        amount,
        status: "PENDING",
      },
      include: {
        room: true,
        service: {
          include: {
            category: true,
          },
        },
      },
    })

    // Update reservation's service charges and total amount
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        serviceCharges: {
          increment: amount,
        },
        totalAmount: {
          increment: amount,
        },
        pendingAmount: {
          increment: amount,
        },
      },
    })

    return NextResponse.json(roomService)
  } catch (error) {
    console.error("[ROOM_SERVICES_POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
