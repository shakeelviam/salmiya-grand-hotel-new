import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const policySchema = z.object({
  // Check-in/out times
  checkInTime: z.string(),
  checkOutTime: z.string(),
  lateCheckoutCharge: z.number().min(0),
  earlyCheckoutCharge: z.number().min(0),
  maxLateCheckoutHours: z.number().min(0).max(24),
  
  // Cancellation policies
  freeCancellationHours: z.number().min(0),
  cancellationCharge: z.number().min(0).max(100),
  
  // No show policies
  noShowCharge: z.number().min(0).max(100),
  noShowDeadlineHours: z.number().min(0).max(48),
  
  // Payment policies
  advancePaymentPercent: z.number().min(0).max(100),
  fullPaymentDeadline: z.number().min(0),
  
  // Reservation policies
  unconfirmedHoldHours: z.number().min(1).max(72),
  minAdvanceBookingHours: z.number().min(0),
  maxAdvanceBookingDays: z.number().min(1).max(365),
  
  // Group booking policies
  minGroupSize: z.number().min(2),
  groupDiscountPercent: z.number().min(0).max(100),
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
          lateCheckoutCharge: 50,
          earlyCheckoutCharge: 100,
          maxLateCheckoutHours: 6,
          freeCancellationHours: 48,
          cancellationCharge: 50,
          noShowCharge: 100,
          noShowDeadlineHours: 24,
          advancePaymentPercent: 20,
          fullPaymentDeadline: 24,
          unconfirmedHoldHours: 24,
          minAdvanceBookingHours: 24,
          maxAdvanceBookingDays: 365,
          minGroupSize: 5,
          groupDiscountPercent: 10,
        }
      })
    }

    return NextResponse.json(policy)
  } catch (error) {
    console.error("[HOTEL_POLICY_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
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
      update: body,
      create: body,
    })

    return NextResponse.json(policy)
  } catch (error) {
    console.error("[HOTEL_POLICY_PATCH]", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
