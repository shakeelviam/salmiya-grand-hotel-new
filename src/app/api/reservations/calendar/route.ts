import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Check permissions
    const hasPermission = await checkPermission(session.user.id, "read", "reservations");
    if (!hasPermission) {
      return NextResponse.json(
        { message: "You don'"t have permission to view reservations." },
        { status: 403 }
      );
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: "Start and end dates are required." },
        { status: 400 }
      );
    }

    // Fetch reservations within the date range
    const reservations = await prisma.reservation.findMany({
      where: {
        OR: [
          {
            // Reservations that start within the range
            checkIn: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
          {
            // Reservations that end within the range
            checkOut: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
          {
            // Reservations that span the entire range
            AND: [
              {
                checkIn: {
                  lte: new Date(startDate),
                },
              },
              {
                checkOut: {
                  gte: new Date(endDate),
                },
              },
            ],
          },
        ],
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        guest: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Transform reservations for calendar view
    const calendarEvents = reservations.map((reservation) => ({
      id: reservation.id,
      title: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
      start: reservation.checkIn,
      end: reservation.checkOut,
      resourceId: reservation.roomId,
      status: reservation.status,
      extendedProps: {
        roomNumber: reservation.room?.number,
        roomType: reservation.room?.roomType.name,
        adults: reservation.adults,
        children: reservation.children,
        totalAmount: reservation.totalAmount,
        status: reservation.status,
        guestEmail: reservation.guest.email,
        guestPhone: reservation.guest.phone,
      },
    }));

    // Get all rooms for resources
    const rooms = await prisma.room.findMany({
      include: {
        roomType: true,
      },
    });

    const resources = rooms.map((room) => ({
      id: room.id,
      title: `${room.number} - ${room.roomType.name}`,
      type: 'room',
    }));

    return NextResponse.json({
      events: calendarEvents,
      resources: resources,
    });
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return NextResponse.json(
      { message: "Error fetching calendar data" },
      { status: 500 }
    );
  }
}
