import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to view payment details" },
        { status: 401 }
      )
    }

    const payment = await db.payment.findUnique({
      where: { id: params.id },
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
    })

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: payment })
  } catch (error) {
    console.error("Failed to fetch payment:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment details" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to update payment" },
        { status: 401 }
      )
    }

    const json = await req.json()
    const { amount, paymentMode, transactionId, notes } = json

    const payment = await db.payment.update({
      where: { id: params.id },
      data: {
        amount,
        paymentMode,
        transactionId,
        notes,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      data: payment,
      message: "Payment updated successfully",
    })
  } catch (error) {
    console.error("Failed to update payment:", error)
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to delete payment" },
        { status: 401 }
      )
    }

    await db.payment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Payment deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete payment:", error)
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    )
  }
}
