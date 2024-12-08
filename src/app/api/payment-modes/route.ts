import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to view payment modes" },
        { status: 401 }
      )
    }

    const paymentModes = await prisma.paymentMode.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ data: paymentModes })
  } catch (error) {
    console.error("Failed to fetch payment modes:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment modes" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to create payment modes" },
        { status: 401 }
      )
    }

    const json = await req.json()
    const { name, code, description, isEnabled, isDefault } = json

    // If this payment mode is set as default, unset any existing default
    if (isDefault) {
      await prisma.paymentMode.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    const paymentMode = await prisma.paymentMode.create({
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
      message: "Payment mode created successfully",
    })
  } catch (error) {
    console.error("Failed to create payment mode:", error)
    return NextResponse.json(
      { error: "Failed to create payment mode" },
      { status: 500 }
    )
  }
}
