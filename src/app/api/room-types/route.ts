import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Validation schema for room type
const roomTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  basePrice: z.number().positive('Base price must be positive'),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  amenities: z.array(z.string()),
  imageUrl: z.string().url().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = roomTypeSchema.parse(body)

    const roomType = await prisma.roomType.create({
      data: validatedData,
    })

    return NextResponse.json(roomType, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const roomTypes = await prisma.roomType.findMany({
      include: {
        rooms: true,
      },
    })
    return NextResponse.json(roomTypes)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
