import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { roomServiceId: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const { status } = json

    const roomService = await prisma.roomService.findUnique({
      where: { id: params.roomServiceId },
    })

    if (!roomService) {
      return new NextResponse("Room service not found", { status: 404 })
    }

    // Update room service status
    const updatedRoomService = await prisma.roomService.update({
      where: { id: params.roomServiceId },
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
    console.error("[ROOM_SERVICE_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { roomServiceId: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const roomService = await prisma.roomService.findUnique({
      where: { id: params.roomServiceId },
      include: {
        reservation: true,
      },
    })

    if (!roomService) {
      return new NextResponse("Room service not found", { status: 404 })
    }

    if (roomService.status !== "PENDING") {
      return new NextResponse("Only pending room service orders can be cancelled", { status: 400 })
    }

    // Update room service status to CANCELLED
    const cancelledRoomService = await prisma.roomService.update({
      where: { id: params.roomServiceId },
      data: { status: "CANCELLED" },
    })

    // Update reservation's service charges and total amount
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

    return NextResponse.json(cancelledRoomService)
  } catch (error) {
    console.error("[ROOM_SERVICE_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}