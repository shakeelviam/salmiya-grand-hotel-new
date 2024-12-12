import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 1. Validate user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Extract and validate query parameters
    const searchParams = req.nextUrl.searchParams;
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const roomTypeId = searchParams.get("roomTypeId");

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Check-in and check-out dates are required." },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format for check-in or check-out." },
        { status: 400 }
      );
    }

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date." },
        { status: 400 }
      );
    }

    console.log("Searching for available rooms with params:", {
      checkIn: checkInDate,
      checkOut: checkOutDate,
      roomTypeId,
    });

    // 3. Fetch available rooms excluding overlapping reservations
    const rooms = await prisma.room.findMany({
      where: {
        isActive: true,
        status: "AVAILABLE",
        ...(roomTypeId && { roomTypeId: roomTypeId }),

        NOT: {
          reservations: {
            some: {
              AND: [
                { status: { in: ["CONFIRMED", "CHECKED_IN"] } },
                {
                  OR: [
                    {
                      AND: [
                        { checkIn: { lte: checkInDate } },
                        { checkOut: { gt: checkInDate } },
                      ],
                    },
                    {
                      AND: [
                        { checkIn: { lt: checkOutDate } },
                        { checkOut: { gte: checkOutDate } },
                      ],
                    },
                    {
                      AND: [
                        { checkIn: { gte: checkInDate } },
                        { checkOut: { lte: checkOutDate } },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            adultCapacity: true,
            childCapacity: true,
            basePrice: true,
            extraBedCharge: true,
          },
        },
      },
    });

    console.log(`Found ${rooms.length} available rooms`);

    // 4. Transform the room data
    const availableRooms = rooms.map((room) => ({
      id: room.id,
      number: room.number,
      floor: room.floor,
      roomType: {
        id: room.roomType.id,
        name: room.roomType.name,
        adultCapacity: room.roomType.adultCapacity,
        childCapacity: room.roomType.childCapacity,
        basePrice: room.roomType.basePrice,
        extraBedCharge: room.roomType.extraBedCharge,
      },
      status: room.status,
    }));

    return NextResponse.json({
      success: true,
      data: availableRooms,
      message: `Found ${availableRooms.length} available rooms.`,
    });
  } catch (error) {
    console.error("Error fetching available rooms:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch available rooms.",
        details: error instanceof Error ? error.message : "Unknown error occurred.",
      },
      { status: 500 }
    );
  }
}
