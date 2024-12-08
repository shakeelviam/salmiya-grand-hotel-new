import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { nanoid } from "nanoid"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to view payments" },
        { status: 401 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const reservationId = searchParams.get("reservationId")
    const status = searchParams.get("status")

    const payments = await prisma.payment.findMany({
      where: {
        ...(reservationId && { reservationId }),
        ...(status && { status }),
      },
      include: {
        reservation: {
          select: {
            roomNumber: true,
            checkIn: true,
            checkOut: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ data: payments })
  } catch (error) {
    console.error("Failed to fetch payments:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to record payments" },
        { status: 401 }
      )
    }

    const json = await req.json()
    const { reservationId, amount, paymentMode, transactionId, notes } = json

    // Validate required fields
    if (!reservationId || !amount || !paymentMode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Generate a unique receipt number
    const receiptNumber = `RCP-${nanoid(8).toUpperCase()}`

    const payment = await prisma.payment.create({
      data: {
        reservationId,
        amount,
        paymentMode,
        transactionId,
        notes,
        receiptNumber,
        status: "COMPLETED",
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      data: payment,
      message: "Payment recorded successfully",
    })
  } catch (error) {
    console.error("Failed to record payment:", error)
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    )
  }
}
