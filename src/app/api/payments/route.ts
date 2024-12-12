import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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
            id: true,
            roomNumber: true,
            checkIn: true,
            checkOut: true,
            totalAmount: true,
            guest: {
              select: {
                name: true,
                email: true,
              }
            }
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

    // Transform the data to include reservation details
    const transformedPayments = payments.map(payment => ({
      id: payment.id,
      receiptNumber: payment.receiptNumber,
      amount: payment.amount,
      paymentMode: payment.paymentMode,
      status: payment.status,
      transactionId: payment.transactionId,
      notes: payment.notes,
      createdAt: payment.createdAt,
      reservation: {
        id: payment.reservation.id,
        roomNumber: payment.reservation.roomNumber,
        checkIn: payment.reservation.checkIn,
        checkOut: payment.reservation.checkOut,
        totalAmount: payment.reservation.totalAmount,
        guestName: payment.reservation.guest?.name || 'N/A',
        guestEmail: payment.reservation.guest?.email || 'N/A',
      },
      recordedBy: {
        name: payment.user.name || 'System',
        email: payment.user.email || 'N/A',
      }
    }))

    return NextResponse.json(transformedPayments)
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

    // Get the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        payments: true
      }
    })

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      )
    }

    // Validate payment amount
    const totalPaid = reservation.payments.reduce((sum, p) => sum + p.amount, 0)
    const remainingAmount = reservation.totalAmount - totalPaid

    if (amount > remainingAmount) {
      return NextResponse.json(
        { error: `Payment amount exceeds remaining balance of ${remainingAmount}` },
        { status: 400 }
      )
    }

    // Generate a unique receipt number
    const receiptNumber = `RCP-${nanoid(8).toUpperCase()}`

    const payment = await prisma.$transaction(async (tx) => {
      // Create payment record
      const newPayment = await tx.payment.create({
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
        include: {
          reservation: {
            select: {
              id: true,
              roomNumber: true,
              checkIn: true,
              checkOut: true,
              totalAmount: true,
              guest: {
                select: {
                  name: true,
                  email: true,
                }
              }
            }
          },
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      })

      // Update reservation's pending amount
      await tx.reservation.update({
        where: { id: reservationId },
        data: {
          pendingAmount: {
            decrement: amount
          },
          status: amount >= remainingAmount ? "CONFIRMED" : undefined
        }
      })

      return newPayment
    })

    // Transform the payment data
    const transformedPayment = {
      id: payment.id,
      receiptNumber: payment.receiptNumber,
      amount: payment.amount,
      paymentMode: payment.paymentMode,
      status: payment.status,
      transactionId: payment.transactionId,
      notes: payment.notes,
      createdAt: payment.createdAt,
      reservation: {
        id: payment.reservation.id,
        roomNumber: payment.reservation.roomNumber,
        checkIn: payment.reservation.checkIn,
        checkOut: payment.reservation.checkOut,
        totalAmount: payment.reservation.totalAmount,
        guestName: payment.reservation.guest?.name || 'N/A',
        guestEmail: payment.reservation.guest?.email || 'N/A',
      },
      recordedBy: {
        name: payment.user.name || 'System',
        email: payment.user.email || 'N/A',
      }
    }

    return NextResponse.json({
      data: transformedPayment,
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
