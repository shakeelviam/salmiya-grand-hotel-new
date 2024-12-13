import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const updateRoomSchema = z.object({
  number: z.string().min(1, "Room number is required"),
  floor: z.string().min(1, "Floor is required"),
  roomTypeId: z.string().min(1, "Room type is required"),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING']),
  notes: z.string().nullable(),
  isActive: z.boolean(),
})

export async function GET(
  _request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    if (!params.roomId) {
      return new NextResponse(
        JSON.stringify({
          error: "Room ID is required",
        }),
        { status: 400 }
      )
    }

    const room = await prisma.room.findUnique({
      where: {
        id: params.roomId,
      },
      include: {
        roomType: true
      }
    })

    if (!room) {
      return new NextResponse(
        JSON.stringify({
          error: "Room not found",
        }),
        { status: 404 }
      )
    }

    // Ensure isAvailable matches status before sending response
    const updatedRoom = {
      ...room,
      isAvailable: room.status === 'AVAILABLE'
    }

    return new NextResponse(JSON.stringify(updatedRoom), { status: 200 })
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
      }),
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
      return new NextResponse(
        JSON.stringify({
          error: "Unauthorized",
        }),
        { status: 401 }
      )
    }

    if (!params.roomId) {
      return new NextResponse(
        JSON.stringify({
          error: "Room ID is required",
        }),
        { status: 400 }
      )
    }

    const json = await request.json()
    const body = updateRoomSchema.parse(json)

    // Set isAvailable based on status
    const isAvailable = body.status === 'AVAILABLE'

    const room = await prisma.room.update({
      where: {
        id: params.roomId,
      },
      data: {
        number: body.number,
        floor: body.floor,
        roomTypeId: body.roomTypeId,
        status: body.status,
        notes: body.notes,
        isActive: body.isActive,
        isAvailable: isAvailable,
      },
      include: {
        roomType: true
      }
    })

    return new NextResponse(JSON.stringify(room), { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({
        error: "Invalid request data",
        details: error.errors,
      }), { status: 400 })
    }

    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
      }),
      { status: 500 }
    )
  }
}
