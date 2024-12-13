import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";

export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
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

    const groupBooking = await prisma.groupBooking.findUnique({
      where: { id: params.bookingId },
      include: {
        reservations: {
          include: {
            room: true,
            roomType: true,
            guest: true,
            bills: true,
            payments: true,
          },
        },
      },
    });

    if (!groupBooking) {
      return NextResponse.json(
        { message: "Group booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(groupBooking);
  } catch (error) {
    console.error("Error fetching group booking:", error);
    return NextResponse.json(
      { message: "Error fetching group booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Check permissions
    const hasPermission = await checkPermission(session.user.id, "update", "group-bookings");
    if (!hasPermission) {
      return NextResponse.json(
        { message: "You don'"t have permission to update group bookings." },
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
      status,
    } = body;

    // Update group booking
    const updatedBooking = await prisma.groupBooking.update({
      where: { id: params.bookingId },
      data: {
        groupName,
        organizationName,
        contactPerson,
        contactEmail,
        contactPhone,
        specialRates,
        discountPercentage,
        notes,
        status,
      },
      include: {
        reservations: {
          include: {
            room: true,
            roomType: true,
            guest: true,
          },
        },
      },
    });

    // If special rates or discount percentage changed, update all reservation amounts
    if (body.specialRates !== undefined || body.discountPercentage !== undefined) {
      await prisma.$transaction(
        updatedBooking.reservations.map((reservation) =>
          prisma.reservation.update({
            where: { id: reservation.id },
            data: {
              roomCharges: specialRates
                ? reservation.roomCharges * (1 - (discountPercentage || 0) / 100)
                : reservation.roomCharges,
              totalAmount: specialRates
                ? reservation.totalAmount * (1 - (discountPercentage || 0) / 100)
                : reservation.totalAmount,
            },
          })
        )
      );
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating group booking:", error);
    return NextResponse.json(
      { message: "Error updating group booking" },
      { status: 500 }
    );
  }
}
