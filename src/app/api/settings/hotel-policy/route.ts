import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const policySchema = z.object({
  checkInTime: z.string(),
  checkOutTime: z.string(),
  lateCheckOutFee: z.number().min(0),
  earlyCheckOutFee: z.number().min(0),
  noShowFee: z.number().min(0),
  freeCancellationHours: z.number().min(0),
  cancellationFee: z.number().min(0),
  refundPercentage: z.number().min(0).max(100),
  lateRefundPercentage: z.number().min(0).max(100),
  unconfirmedHoldHours: z.number().min(0),
})

export async function GET() {
  try {
    // Get the first policy record or create default if none exists
    let policy = await prisma.hotelPolicy.findFirst()
    
    if (!policy) {
      policy = await prisma.hotelPolicy.create({
        data: {
          checkInTime: "14:00",
          checkOutTime: "12:00",
          lateCheckOutFee: 0,
          earlyCheckOutFee: 0,
          noShowFee: 0,
          freeCancellationHours: 24,
          cancellationFee: 0,
          refundPercentage: 100,
          lateRefundPercentage: 0,
          unconfirmedHoldHours: 24,
        }
      })
    }

    return new NextResponse(JSON.stringify(policy), { status: 200 })
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
      }),
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse(
        JSON.stringify({
          error: "Unauthorized",
        }),
        { status: 401 }
      )
    }

    const json = await request.json()
    const body = policySchema.parse(json)

    // Update or create policy
    const policy = await prisma.hotelPolicy.upsert({
      where: {
        id: (await prisma.hotelPolicy.findFirst())?.id || 'default',
      },
      update: {
        ...body,
      },
      create: {
        ...body,
      },
    })

    return new NextResponse(JSON.stringify(policy), { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({
        error: "Invalid request data",
        details: error.errors,
      }), { status: 400 })
    }

    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
      }),
      { status: 500 }
    )
  }
}
