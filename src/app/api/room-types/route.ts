import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET: Fetch all room types
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const roomTypes = await prisma.roomType.findMany({
      select: {
        id: true,
        name: true,
        basePrice: true,
      },
    })

    // Ensure all room types have valid IDs
    const validRoomTypes = roomTypes.map(type => ({
      id: type.id || `type-${Date.now()}`, // Fallback ID if none exists
      name: type.name,
      basePrice: type.basePrice,
    }))

    return NextResponse.json(validRoomTypes)
  } catch (error) {
    console.error("Error fetching room types:", error)
    return NextResponse.json(
      { message: "Failed to fetch room types" },
      { status: 500 }
    )
  }
}

// POST: Create a new room type
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse the request body
    const json = await request.json()

    // Convert string values to numbers and validate
    const adultCapacity = parseInt(json.adultCapacity)
    const childCapacity = parseInt(json.childCapacity)
    const basePrice = parseFloat(json.basePrice)
    const extraBedCharge = parseFloat(json.extraBedCharge)

    // Validate the required fields
    if (!json.name || !json.description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      )
    }

    // Validate numeric fields
    if (
      isNaN(adultCapacity) ||
      isNaN(childCapacity) ||
      isNaN(basePrice) ||
      isNaN(extraBedCharge)
    ) {
      return NextResponse.json(
        { error: "Invalid numeric values provided" },
        { status: 400 }
      )
    }

    // Create the room type
    const roomType = await prisma.roomType.create({
      data: {
        name: json.name,
        description: json.description,
        adultCapacity,
        childCapacity,
        basePrice,
        extraBedCharge,
        isActive: true
      },
    })

    return NextResponse.json(roomType)
  } catch (error) {
    console.error("Error creating room type:", error)
    return NextResponse.json(
      { error: "Failed to create room type" },
      { status: 500 }
    )
  }
}
