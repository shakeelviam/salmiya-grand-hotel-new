import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    console.log('Starting test email send to:', email)

    const result = await sendEmail(email, "reservation-confirmation", {
      name: "Test Guest",
      reservationId: "RES123456",
      checkIn: new Date().toLocaleDateString(),
      checkOut: new Date(Date.now() + 86400000).toLocaleDateString(), // Tomorrow
      roomType: "Deluxe Suite",
      roomNumber: "301",
      totalAmount: 150.00,
      advanceAmount: 50.00,
      viewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reservations/RES123456`
    })

    if (!result.success) {
      console.error('Email send failed:', result.error)
      return NextResponse.json(
        { message: "Failed to send email", error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: "Test email sent successfully",
      data: result.data
    })
  } catch (error: any) {
    console.error("[TEST_EMAIL]", error)
    return NextResponse.json(
      { 
        message: error.message || "Something went wrong",
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
