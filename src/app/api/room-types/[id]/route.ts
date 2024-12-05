import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession()
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
        extraBedPrice: json.extraBedPrice,
      },
    })

    return NextResponse.json(roomType)
  } catch (error) {
    console.error("Failed to update room type:", error)
    return NextResponse.json(
      { error: "Failed to update room type" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse the incoming JSON request
    const { isActive } = await request.json()

    // Update the room type to toggle its active status
    const roomType = await prisma.roomType.update({
      where: { id: params.id },
      data: {
        isActive,
      },
    })

    return NextResponse.json({
      message: `Room type ${isActive ? "enabled" : "disabled"} successfully`,
      roomType,
    })
  } catch (error) {
    console.error("Failed to update room type status:", error)
    return NextResponse.json(
      { error: "Failed to update room type status" },
      { status: 500 }
    )
  }
}
