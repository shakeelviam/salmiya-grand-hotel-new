import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log("[ROOMS_GET] Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const roomTypeId = searchParams.get("roomTypeId")
    const isAvailable = searchParams.get("isAvailable")

    console.log("[ROOMS_GET] Received data:", {
      roomTypeId,
      isAvailable,
    })

    const rooms = await prisma.room.findMany({
      where: {
        ...(roomTypeId && { roomTypeId }),
        ...(isAvailable && { isAvailable: isAvailable === "true" }),
      },
      include: {
        roomType: true,
        reservations: {
          where: {
            status: {
              in: ["CONFIRMED", "CHECKED_IN"],
            },
          },
          orderBy: {
            checkIn: "asc",
          },
          take: 1,
        },
      },
      orderBy: {
        number: "asc",
      },
    })

    console.log("[ROOMS_GET] Retrieved rooms:", rooms)

    // Transform the data to include current guest info and room type details
    const transformedRooms = rooms.map((room) => {
      const currentReservation = room.reservations[0]
      return {
        id: room.id || "",
        number: room.number || "",
        floor: room.floor || "",
        roomType: {
          id: room.roomType.id || "",
          name: room.roomType.name || "",
          basePrice: room.roomType.basePrice || 0,
          extraBedCharge: room.roomType.extraBedCharge || 0,
        },
        isAvailable: room.isAvailable,
        status: currentReservation
          ? currentReservation.status
          : room.isAvailable
          ? "Available"
          : "Maintenance",
        guest: currentReservation?.userId || "-",
        checkIn: currentReservation?.checkIn.toISOString().split("T")[0] || "-",
        checkOut: currentReservation?.checkOut.toISOString().split("T")[0] || "-",
      }
    })

    console.log("[ROOMS_GET] Transformed rooms:", transformedRooms)
    return NextResponse.json(transformedRooms)
  } catch (error) {
    console.error("[ROOMS_GET] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log("[ROOMS_POST] Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const number = formData.get("number") as string
    const floor = formData.get("floor") as string
    const roomTypeId = formData.get("roomTypeId") as string
    const isAvailable = formData.get("isAvailable") === "true"

    console.log("[ROOMS_POST] Received data:", {
      number,
      floor,
      roomTypeId,
      isAvailable,
    })

    // Validate required fields
    if (!number || !floor || !roomTypeId) {
      console.log("[ROOMS_POST] Missing fields:", { number, floor, roomTypeId })
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      )
    }

    // Check if room number already exists
    const existingRoom = await prisma.room.findFirst({
      where: { number },
    })

    if (existingRoom) {
      console.log("[ROOMS_POST] Room number already exists:", number)
      return NextResponse.json(
        { error: "Room number already exists" },
        { status: 400 }
      )
    }

    // Create room
    console.log("[ROOMS_POST] Creating room with data:", {
      number,
      floor,
      roomTypeId,
      isAvailable,
    })

    const room = await prisma.room.create({
      data: {
        number,
        floor,
        roomTypeId,
        isAvailable,
      },
      include: {
        roomType: true,
      },
    })

    console.log("[ROOMS_POST] Room created successfully:", room)
    return NextResponse.json(room)
  } catch (error) {
    console.error("[ROOMS_POST] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create room" },
      { status: 500 }
    )
  }
}
