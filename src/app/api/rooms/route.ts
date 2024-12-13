import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("[ROOMS_GET] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomTypeId = searchParams.get("roomTypeId");
    const isAvailable = searchParams.get("isAvailable");

    console.log("[ROOMS_GET] Received data:", {
      roomTypeId,
      isAvailable,
    });

    // Test query to verify database connection
    try {
      const testQuery = await prisma.$queryRaw`SELECT 1`;
      console.log("[ROOMS_GET] Test query result:", testQuery);
    } catch (queryError) {
      console.error("[ROOMS_GET] Test query error:", queryError);
      return NextResponse.json(
        {
          error:
            queryError instanceof Error
              ? `Database connection error: ${queryError.message}`
              : "Database connection error",
        },
        { status: 500 }
      );
    }

    const rooms = await prisma.room.findMany({
      where: {
        ...(roomTypeId && { roomTypeId }),
      },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            adultCapacity: true,
            childCapacity: true,
          },
        },
      },
      orderBy: {
        number: "asc",
      },
    });

    console.log("[ROOMS_GET] Retrieved rooms:", rooms);

    // Transform the data to include room type details
    const transformedRooms = rooms.map((room) => ({
      id: room.id,
      number: room.number,
      floor: room.floor,
      roomType: {
        id: room.roomType.id,
        name: room.roomType.name,
        basePrice: room.roomType.basePrice,
        adultCapacity: room.roomType.adultCapacity,
        childCapacity: room.roomType.childCapacity,
      },
      status: room.status,
      isActive: room.isActive,
    }));

    console.log("[ROOMS_GET] Transformed rooms:", transformedRooms);
    return NextResponse.json({ rooms: transformedRooms });
  } catch (error) {
    console.error("[ROOMS_GET] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("[ROOMS_POST] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    console.log("[ROOMS_POST] Received data:", json);

    // Validate required fields
    if (!json.number || !json.roomTypeId || !json.floor) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the room with proper data structure
    const room = await prisma.room.create({
      data: {
        number: json.number,
        floor: json.floor,
        roomTypeId: json.roomTypeId,
        status: "AVAILABLE",
        isActive: true,
        amenities: Array.isArray(json.amenities) ? json.amenities : [],
        notes: json.notes || null,
      },
      include: {
        roomType: true
      }
    });

    console.log("[ROOMS_POST] Created room:", room);
    return NextResponse.json(room);
  } catch (error) {
    console.error("[ROOMS_POST] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create room" },
      { status: 500 }
    );
  }
}
