import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withPermission } from "@/lib/permissions"

// GET: Fetch all room types
export const GET = withPermission(
  async function GET() {
    try {
      // Fetch all room types ordered by creation date
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
  { action: "READ", subject: "roomType" } // Permission for reading room types
)

// POST: Create a new room type
export const POST = withPermission(
  async function POST(request: Request) {
    try {
      // Parse the request body
      const json = await request.json()

      // Validate the required fields
      if (
        !json.name ||
        !json.description ||
        typeof json.adultCapacity !== "number" ||
        typeof json.childCapacity !== "number" ||
        typeof json.basePrice !== "number" ||
        typeof json.extraBedPrice !== "number"
      ) {
        return NextResponse.json(
          { error: "Invalid data provided" },
          { status: 400 }
        )
      }

      // Create a new room type in the database
      const roomType = await prisma.roomType.create({
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
      console.error("Error creating room type:", error)
      return NextResponse.json(
        { error: "Failed to create room type" },
        { status: 500 }
      )
    }
  },
  { action: "CREATE", subject: "roomType" } // Permission for creating room types
)
