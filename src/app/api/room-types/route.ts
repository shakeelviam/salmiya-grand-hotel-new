import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withPermission } from "@/lib/permissions"

export const GET = withPermission(
  async function GET() {
    try {
      const roomTypes = await prisma.roomType.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      })
      return NextResponse.json(roomTypes)
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch room types" },
        { status: 500 }
      )
    }
  },
  { action: "READ", subject: "roomType" }
)

export const POST = withPermission(
  async function POST(request: Request) {
    try {
      const json = await request.json()
      const roomType = await prisma.roomType.create({
        data: {
          name: json.name,
          description: json.description,
          adultCapacity: json.adultCapacity,
          childCapacity: json.childCapacity,
          basePrice: json.basePrice,
          extraBedPrice: json.extraBedPrice,
        }
      })

      return NextResponse.json(roomType)
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to create room type" },
        { status: 500 }
      )
    }
  },
  { action: "CREATE", subject: "roomType" }
)
