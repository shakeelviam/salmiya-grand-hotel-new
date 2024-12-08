import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  req: Request,
  { params }: { params: { roomServiceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { roomServiceId } = params
    const json = await req.json()
    const { status } = json

    // Verify room service order exists
    const roomService = await prisma.roomService.findUnique({
      where: { id: roomServiceId },
      include: {
        reservation: true,
      },
    })

    if (!roomService) {
      return NextResponse.json(
        { error: "Room service order not found" },
        { status: 404 }
      )
    }

    // Only allow status updates for valid transitions
    const validTransitions = {
      PENDING: ["PREPARING", "CANCELLED"],
      PREPARING: ["READY", "CANCELLED"],
      READY: ["DELIVERED", "CANCELLED"],
      DELIVERED: [],
      CANCELLED: ["PENDING"],
    }

    if (!validTransitions[roomService.status].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status transition" },
        { status: 400 }
      )
    }

    // If cancelling order, refund the amount
    if (status === "CANCELLED") {
      await prisma.reservation.update({
        where: { id: roomService.reservationId },
        data: {
          serviceCharges: {
            decrement: roomService.amount,
          },
          totalAmount: {
            decrement: roomService.amount,
          },
          pendingAmount: {
            decrement: roomService.amount,
          },
        },
      })
    }

    // If restoring cancelled order, add back the charges
    if (roomService.status === "CANCELLED" && status === "PENDING") {
      await prisma.reservation.update({
        where: { id: roomService.reservationId },
        data: {
          serviceCharges: {
            increment: roomService.amount,
          },
          totalAmount: {
            increment: roomService.amount,
          },
          pendingAmount: {
            increment: roomService.amount,
          },
        },
      })
    }

    // Update room service order status
    const updatedRoomService = await prisma.roomService.update({
      where: { id: roomServiceId },
      data: { status },
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
    })

    return NextResponse.json(updatedRoomService)
  } catch (error) {
    console.error("[ROOM_SERVICE_STATUS_PATCH]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
