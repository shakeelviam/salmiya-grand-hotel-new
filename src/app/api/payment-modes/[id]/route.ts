import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to view payment mode details" },
        { status: 401 }
      )
    }

    const paymentMode = await prisma.paymentMode.findUnique({
      where: { id: params.id },
    })

    if (!paymentMode) {
      return NextResponse.json(
        { error: "Payment mode not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: paymentMode })
  } catch (error) {
    console.error("Failed to fetch payment mode:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment mode details" },
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
        { error: "Please sign in to update payment mode" },
        { status: 401 }
      )
    }

    const json = await req.json()
    const { name, code, description, isEnabled, isDefault } = json

    // If this payment mode is set as default, unset any existing default
    if (isDefault) {
      await prisma.paymentMode.updateMany({
        where: { 
          isDefault: true,
          id: { not: params.id }
        },
        data: { isDefault: false },
      })
    }

    const paymentMode = await prisma.paymentMode.update({
      where: { id: params.id },
      data: {
        name,
        code,
        description,
        isEnabled,
        isDefault,
      },
    })

    return NextResponse.json({
      data: paymentMode,
      message: "Payment mode updated successfully",
    })
  } catch (error) {
    console.error("Failed to update payment mode:", error)
    return NextResponse.json(
      { error: "Failed to update payment mode" },
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
        { error: "Please sign in to delete payment mode" },
        { status: 401 }
      )
    }

    // Check if the payment mode has any associated payments
    const paymentCount = await prisma.payment.count({
      where: { paymentModeId: params.id },
    })

    if (paymentCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete payment mode as it has associated payments. Please disable it instead.",
        },
        { status: 400 }
      )
    }

    await prisma.paymentMode.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Payment mode deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete payment mode:", error)
    return NextResponse.json(
      { error: "Failed to delete payment mode" },
      { status: 500 }
    )
  }
}
