import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "edge"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const policy = await prisma.hotelPolicy.findFirst()
    
    if (!policy) {
      throw new Error("Hotel policy not found")
    }

    // Handle unconfirmed reservations
    const unconfirmedDeadline = new Date(now.getTime() - policy.unconfirmedHoldHours * 60 * 60 * 1000)
    await prisma.reservation.updateMany({
      where: {
        status: "UNCONFIRMED",
        createdAt: {
          lt: unconfirmedDeadline
        }
      },
      data: {
        status: "CANCELLED",
        cancellationReason: "Automatic cancellation due to payment not received within hold period"
      }
    })

    // Handle no-shows for confirmed reservations
    const noShowDeadline = new Date(now.getTime() - policy.noShowDeadlineHours * 60 * 60 * 1000)
    const [checkInHour, checkInMinute] = policy.checkInTime.split(":").map(Number)
    
    const confirmedReservations = await prisma.reservation.findMany({
      where: {
        status: "CONFIRMED",
        checkIn: {
          lt: noShowDeadline
        }
      }
    })

    for (const reservation of confirmedReservations) {
      const checkInDate = new Date(reservation.checkIn)
      checkInDate.setHours(checkInHour, checkInMinute, 0, 0)
      
      if (now > new Date(checkInDate.getTime() + policy.noShowDeadlineHours * 60 * 60 * 1000)) {
        // Calculate no-show fee
        const noShowFee = (reservation.totalAmount * policy.noShowCharge) / 100

        await prisma.reservation.update({
          where: { id: reservation.id },
          data: {
            status: "NO_SHOW",
            noShowDate: now,
            noShowFee: noShowFee
          }
        })

        // Create activity log
        await prisma.activityLog.create({
          data: {
            reservationId: reservation.id,
            action: "NO_SHOW",
            description: `Marked as no-show automatically. No-show fee: ${noShowFee}`,
            timestamp: now
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Reservation statuses updated successfully"
    })
  } catch (error) {
    console.error("[UPDATE_RESERVATION_STATUSES]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
