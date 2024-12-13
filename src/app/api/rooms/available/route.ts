import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const roomTypeId = searchParams.get("roomTypeId")
    const checkIn = searchParams.get("checkIn")
    const checkOut = searchParams.get("checkOut")

    // Get all rooms that are available (not assigned to any active reservation)
    const availableRooms = await prisma.room.findMany({
      where: {
        ...(roomTypeId ? { roomTypeId } : {}),
        status: 'AVAILABLE',
        // Exclude rooms that have active reservations during the requested period
        NOT: {
          reservations: {
            some: {
              status: {
                in: ['CONFIRMED', 'CHECKED_IN']
              },
              ...(checkIn && checkOut ? {
                OR: [
                  {
                    AND: [
                      { checkIn: { lte: new Date(checkIn) } },
                      { checkOut: { gte: new Date(checkIn) } }
                    ]
                  },
                  {
                    AND: [
                      { checkIn: { lte: new Date(checkOut) } },
                      { checkOut: { gte: new Date(checkOut) } }
                    ]
                  }
                ]
              } : {})
            }
          }
        }
      },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            description: true
          }
        }
      },
      orderBy: {
        number: 'asc'"
      }
    })

    return NextResponse.json({
      data: availableRooms,
      message: "Available rooms fetched successfully"
    })

  } catch (error) {
    console.error("Error fetching available rooms:", error)
    return NextResponse.json(
      { error: "Failed to fetch available rooms" },
      { status: 500 }
    )
  }
}
