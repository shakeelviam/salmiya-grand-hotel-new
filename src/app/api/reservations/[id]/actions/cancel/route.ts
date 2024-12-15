import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
    if (!["UNCONFIRMED", "CONFIRMED"].includes(reservation.status)) {
      return NextResponse.json(
        { error: "Only unconfirmed or confirmed reservations can be cancelled" },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: "CANCELLED",
          cancellationReason: body.reason || "No reason provided",
          cancellationTime: new Date(),
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
          action: "CANCEL",
          description: `Cancelled. Reason: ${body.reason || "No reason provided"}`,
        },
      });

      return updatedReservation;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CANCEL]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
