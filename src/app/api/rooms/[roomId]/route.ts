import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.roomId },
      include: {
        roomType: true,
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error("Error fetching room:", error)
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const json = await request.json()
    const { number, floor, roomTypeId, description, isAvailable, status, notes } = json

    // Validate required fields
    if (!number || !floor || !roomTypeId) {
      return NextResponse.json(
        { error: "Required fields missing: number, floor, and roomType are required" },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      )
    }

    // Check if room number is unique (excluding current room)
    if (number) {
      const existingRoom = await prisma.room.findFirst({
        where: {
          number,
          NOT: {
            id: params.roomId
          }
        }
      })

      if (existingRoom) {
        return NextResponse.json(
          { error: "Room number already exists" },
          { status: 400 }
        )
      }
    }

    // Verify room type exists
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId }
    })

    if (!roomType) {
      return NextResponse.json(
        { error: "Invalid room type selected" },
        { status: 400 }
      )
    }

    const room = await prisma.room.update({
      where: { id: params.roomId },
      data: {
        number,
        floor,
        roomTypeId,
        description,
        isAvailable,
        status,
        notes,
        updatedAt: new Date(),
      },
      include: {
        roomType: true,
      },
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error("Error updating room:", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if room has any reservations
    const reservations = await prisma.reservation.findMany({
      where: {
        roomId: params.roomId,
        status: {
          in: ['CONFIRMED', 'CHECKED_IN']
        }
      }
    })

    if (reservations.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete room with active reservations" },
        { status: 400 }
      )
    }

    await prisma.room.delete({
      where: { id: params.roomId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting room:", error)
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    )
  }
}
