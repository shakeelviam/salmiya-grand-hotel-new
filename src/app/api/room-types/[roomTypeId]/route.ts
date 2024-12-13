import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET: Fetch a single room type by ID
export async function GET(
  request: Request,
  { params }: { params: { roomTypeId: string } }
) {
  try {
    const roomType = await prisma.roomType.findUnique({
      where: {
        id: params.roomTypeId,
      },
    })

    if (!roomType) {
      return NextResponse.json(
        { error: "Room type not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ roomType })
  } catch (error) {
    console.error("Error fetching room type:", error)
    return NextResponse.json(
      { error: "Failed to fetch room type" },
      { status: 500 }
    )
  }
}

// PATCH: Update a room type
export async function PATCH(
  request: Request,
  { params }: { params: { roomTypeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const roomType = await prisma.roomType.update({
      where: {
        id: params.roomTypeId,
      },
      data: body,
    })

    return NextResponse.json({ roomType })
  } catch (error) {
    console.error("Error updating room type:", error)
    return NextResponse.json(
      { error: "Failed to update room type" },
      { status: 500 }
    )
  }
}
