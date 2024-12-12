import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/permissions";
import { type Params } from "next/dist/shared/lib/router/utils/route-matcher";

export async function POST(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const params = await context.params;
    console.log("Received params:", params);
    const reservationId = params?.reservationId;
    console.log("Extracted reservationId:", reservationId);
    
    if (!reservationId || typeof reservationId !== "string") {
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

    const rawBody = await req.text();
    console.log("Raw request body:", rawBody);
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    console.log("Parsed body:", body);
    const { roomId } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        roomType: true,
      },
    });

    console.log("Found reservation:", reservation);
    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Only confirmed reservations can be checked in" },
        { status: 400 }
      );
    }

    // Use advanceAmount instead of payments for validation
    const minimumRequired = reservation.totalAmount * 0.5;
    if (reservation.advanceAmount < minimumRequired) {
      return NextResponse.json(
        {
          error: "Insufficient payment for check-in",
          details: {
            totalAmount: reservation.totalAmount,
            minimumRequired,
            paid: reservation.advanceAmount,
            remaining: minimumRequired - reservation.advanceAmount,
          },
        },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        reservations: {
          where: {
            status: { in: ["CHECKED_IN", "CONFIRMED"] },
            NOT: { id: reservationId },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Selected room does not exist" },
        { status: 404 }
      );
    }

    if (room.status !== "AVAILABLE" || room.reservations.length > 0) {
      return NextResponse.json(
        { error: "The selected room is not available" },
        { status: 400 }
      );
    }

    if (room.roomTypeId !== reservation.roomTypeId) {
      return NextResponse.json(
        { error: "Selected room type does not match the reservation" },
        { status: 400 }
      );
    }

    const updatedReservation = await prisma.$transaction(async (tx) => {
      await tx.room.update({
        where: { id: roomId },
        data: { status: "OCCUPIED" },
      });

      return tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: "CHECKED_IN",
          room: {
            connect: {
              id: roomId
            }
          }
        },
        include: {
          room: true
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: updatedReservation,
      message: `Guest successfully checked into Room ${updatedReservation.room.number}`,
    });
  } catch (error) {
    console.error("Error during check-in:", error);
    return NextResponse.json(
      { error: "An error occurred while processing check-in" },
      { status: 500 }
    );
  }
}
