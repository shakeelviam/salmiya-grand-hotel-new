import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/permissions";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservationId = params.id;
    console.log("Reservation ID:", reservationId);
    
    if (!reservationId) {
      return NextResponse.json(
        { error: "Invalid reservation ID" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    console.log("Session user:", session?.user);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const hasPermission = await checkPermission(session.user.id, "manage_reservations");
    console.log("Has permission:", hasPermission);
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to perform this action" },
        { status: 403 }
      );
    }

    const body = await req.json();
    console.log("Request body:", body);

    // Get the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        roomType: true,
        room: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Validate reservation status
    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Reservation must be confirmed before check-in" },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: "CHECKED_IN",
          checkInTime: new Date(),
          roomId: body.roomId,
        },
        include: {
          roomType: true,
          room: true,
        },
      });

      // Create activity log
      await tx.activityLog.create({
        data: {
          reservationId,
          userId: session.user.id,
          action: "CHECK_IN",
          description: `Checked in to room ${body.roomId}`,
        },
      });

      return updatedReservation;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CHECK_IN]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
