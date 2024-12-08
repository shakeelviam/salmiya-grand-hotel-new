import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roomTypeId = searchParams.get("roomTypeId")

    if (!roomTypeId) {
      return new NextResponse("Room type ID is required", { status: 400 })
    }

    console.log("[ROOMS_AVAILABLE] Searching for roomTypeId:", roomTypeId)

    // First, check if the room type exists
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId }
    })

    if (!roomType) {
      console.log("[ROOMS_AVAILABLE] Room type not found")
      return new NextResponse("Room type not found", { status: 404 })
    }

    console.log("[ROOMS_AVAILABLE] Found room type:", roomType)

    // Get active reservations for this room type
    const activeReservations = await prisma.reservation.findMany({
      where: {
        roomTypeId: roomTypeId,
        status: {
          in: ["CHECKED_IN", "CONFIRMED"]
        }
      },
      select: {
        roomId: true
      }
    })

    console.log("[ROOMS_AVAILABLE] Active reservations:", activeReservations)

    const occupiedRoomIds = activeReservations
      .map(res => res.roomId)
      .filter((id): id is string => id !== null)

    console.log("[ROOMS_AVAILABLE] Occupied room IDs:", occupiedRoomIds)

    // Get available rooms that are not occupied
    const availableRooms = await prisma.room.findMany({
      where: {
        roomTypeId: roomTypeId,
        isAvailable: true,
        id: {
          notIn: occupiedRoomIds
        }
      },
      include: {
        roomType: true
      },
      orderBy: {
        number: 'asc'
      }
    })

    console.log("[ROOMS_AVAILABLE] Found available rooms:", availableRooms)

    return NextResponse.json(availableRooms)
  } catch (error) {
    console.error("[ROOMS_AVAILABLE] Error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
