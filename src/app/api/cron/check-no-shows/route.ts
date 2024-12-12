import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addHours, isBefore } from "date-fns";

export async function GET(request: Request) {
  try {
    // Verify cron secret to ensure only authorized calls
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find all CONFIRMED reservations that are past their check-in time by 12 hours
    const noShowReservations = await prisma.reservation.findMany({
      where: {
        status: "CONFIRMED",
        checkInDate: {
          lt: addHours(new Date(), -12) // Less than 12 hours ago
        },
        isCheckedIn: false
      }
    });

    // Update these reservations to NO_SHOW status
    const updates = await Promise.all(
      noShowReservations.map(reservation =>
        prisma.reservation.update({
          where: { id: reservation.id },
          data: {
            status: "NO_SHOW",
            requiresAdminRefund: true // Flag to indicate admin approval needed
          }
        })
      )
    );

    return NextResponse.json({
      message: `Updated ${updates.length} reservations to NO_SHOW status`,
      updatedReservations: updates
    });

  } catch (error) {
    console.error("[CHECK_NO_SHOWS_ERROR]", error);
    return NextResponse.json(
      { message: "An error occurred while checking for no-shows" },
      { status: 500 }
    );
  }
}
