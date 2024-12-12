import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";

export async function POST(
  request: Request,
  { params }: { params: { reservationId: string } }
) {
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
    const hasPermission = await checkPermission(session.user.id, "manage_reservations");
    if (!hasPermission) {
      return NextResponse.json(
        { message: "Permission denied. You cannot perform check-out." },
        { status: 403 }
      );
    }

    const reservationId = params.reservationId;
    const data = await request.json();
    const settleAmount = data.settleAmount ?? 0; // Default to 0 if not provided

    // Validate reservation exists and is checked in
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        room: true,
        payments: true
      }
    });

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found." },
        { status: 404 }
      );
    }

    if (reservation.status !== "CHECKED_IN") {
      return NextResponse.json(
        { message: "Reservation must be checked in before check-out." },
        { status: 400 }
      );
    }

    if (reservation.isCheckedOut) {
      return NextResponse.json(
        { message: "Reservation is already checked out." },
        { status: 400 }
      );
    }

    // Update reservation and room status
    const [updatedReservation] = await prisma.$transaction([
      prisma.reservation.update({
        where: { id: reservationId },
        data: {
          status: "COMPLETED",
          isCheckedOut: true,
          checkOutDate: new Date(),
          settleAmount: settleAmount
        }
      }),
      prisma.room.update({
        where: { id: reservation.roomId },
        data: { status: "CLEANING" }  // Set to cleaning after check-out
      })
    ]);

    return NextResponse.json({
      message: "Check-out successful",
      reservation: updatedReservation
    });

  } catch (error) {
    console.error("[RESERVATION_CHECKOUT]", error);
    return NextResponse.json(
      { message: "An error occurred during check-out." },
      { status: 500 }
    );
  }
}
