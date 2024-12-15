import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const hasPermission = await checkPermission(session.user.id, "manage_reservations");
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
    if (reservation.status !== "CHECKED_IN") {
      return NextResponse.json(
        { error: "Only checked-in reservations can be checked out" },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: "CHECKED_OUT",
          checkOutTime: new Date(),
          settledAmount: body.settledAmount || 0,
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
          action: "CHECK_OUT",
          description: `Checked out. Settled amount: ${body.settledAmount || 0}`,
        },
      });

      return updatedReservation;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CHECK_OUT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
