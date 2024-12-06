import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withPermission } from "@/lib/permissions"

// GET: Fetch all room types
export const GET = withPermission(
  async function GET() {
    try {
      const roomTypes = await prisma.roomType.findMany({
        orderBy: {
          createdAt: "desc",
        },
      })
      return NextResponse.json(roomTypes)
    } catch (error) {
      console.error("Error fetching room types:", error)
      return NextResponse.json(
        { error: "Failed to fetch room types" },
        { status: 500 }
      )
    }
  },
  { action: "READ", subject: "roomType" }
)

// POST: Create a new room type
export const POST = withPermission(
  async function POST(request: Request) {
    try {
      // Parse the request body
      const json = await request.json()

      // Convert string values to numbers and validate
      const adultCapacity = parseInt(json.adultCapacity)
      const childCapacity = parseInt(json.childCapacity)
      const basePrice = parseFloat(json.basePrice)
      const extraBedPrice = parseFloat(json.extraBedPrice)

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
        isNaN(extraBedPrice) ||
        adultCapacity < 1 ||
        childCapacity < 0 ||
        basePrice < 0 ||
        extraBedPrice < 0
      ) {
        return NextResponse.json(
          { error: "Invalid numeric values provided" },
          { status: 400 }
        )
      }

      // Create a new room type in the database
      const roomType = await prisma.roomType.create({
        data: {
          name: json.name,
          description: json.description,
          adultCapacity,
          childCapacity,
          basePrice,
          extraBedPrice,
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
  },
  { action: "CREATE", subject: "roomType" }
)
