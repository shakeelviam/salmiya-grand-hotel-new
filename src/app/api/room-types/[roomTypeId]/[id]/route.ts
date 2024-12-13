import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function PUT(
  request: Request,
  { params }: { params: { roomTypeId: string; id: string } }
) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse the incoming JSON request
    const json = await request.json()

    // Update the room type in the database
    const roomType = await prisma.roomType.update({
      where: { id: params.id },
      data: {
        name: json.name,
        description: json.description,
        adultCapacity: json.adultCapacity,
        childCapacity: json.childCapacity,
        basePrice: json.basePrice,
        extraBedCharge: json.extraBedCharge,
        amenities: json.amenities,
        status: json.status
      },
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

export async function PATCH(
  request: Request,
  { params }: { params: { roomTypeId: string; id: string } }
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
    const { status } = json

    if (!status || !['ACTIVE', 'DISABLED'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      )
    }

    const roomType = await prisma.roomType.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json({ roomType })
  } catch (error) {
    console.error("Error updating room type status:", error)
    return NextResponse.json(
      { error: "Failed to update room type status" },
      { status: 500 }
    )
  }
}
