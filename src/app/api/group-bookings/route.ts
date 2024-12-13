import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Check permissions
    const hasPermission = await checkPermission(session.user.id, "create", "group-bookings");
    if (!hasPermission) {
      return NextResponse.json(
        { message: "You don'"t have permission to create group bookings." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      groupName,
      organizationName,
      contactPerson,
      contactEmail,
      contactPhone,
      specialRates,
      discountPercentage,
      notes,
      startDate,
      endDate,
      totalRooms,
      reservations,
    } = body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Create group booking with reservations in a transaction
    const groupBooking = await prisma.$transaction(async (tx) => {
      // Create the group booking
      const booking = await tx.groupBooking.create({
        data: {
          groupName,
          organizationName,
          contactPerson,
          contactEmail,
          contactPhone,
          specialRates,
          discountPercentage,
          notes,
          startDate: start,
          endDate: end,
          totalRooms,
        },
      });

      // Create all reservations
      if (reservations && reservations.length > 0) {
        for (const reservation of reservations) {
          await tx.reservation.create({
            data: {
              ...reservation,
              groupBookingId: booking.id,
              // Apply discount if special rates are enabled
              roomCharges: specialRates
                ? reservation.roomCharges * (1 - (discountPercentage || 0) / 100)
                : reservation.roomCharges,
              totalAmount: specialRates
                ? reservation.totalAmount * (1 - (discountPercentage || 0) / 100)
                : reservation.totalAmount,
            },
          });
        }
      }

      return booking;
    });

    return NextResponse.json(groupBooking);
  } catch (error) {
    console.error("Error creating group booking:", error);
    return NextResponse.json(
      { message: "Error creating group booking" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Check permissions
    const hasPermission = await checkPermission(session.user.id, "read", "group-bookings");
    if (!hasPermission) {
      return NextResponse.json(
        { message: "You don'"t have permission to view group bookings." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause
    const where = status ? { status } : {};

    // Get total count
    const total = await prisma.groupBooking.count({ where });

    // Get group bookings with their reservations
    const groupBookings = await prisma.groupBooking.findMany({
      where,
      include: {
        reservations: {
          include: {
            room: true,
            roomType: true,
            guest: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: groupBookings,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching group bookings:", error);
    return NextResponse.json(
      { message: "Error fetching group bookings" },
      { status: 500 }
    );
  }
}
