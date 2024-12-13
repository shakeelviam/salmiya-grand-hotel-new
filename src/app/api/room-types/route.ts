import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// GET: Fetch all room types
export async function GET() {
  try {
    console.log("Fetching session...")
    const session = await getServerSession(authOptions)
    console.log("Session status:", session ? "authenticated" : "unauthenticated")
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log("Fetching room types from database...")
    const roomTypes = await prisma.roomType.findMany({
      select: {
        id: true,
        name: true,
        basePrice: true,
        adultCapacity: true,
        childCapacity: true,
        amenities: true,
        description: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log("Successfully fetched room types:", roomTypes.length)
    return NextResponse.json({ roomTypes })
  } catch (error) {
    console.error("Error in GET /api/room-types:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// POST: Create a new room type
export async function POST(request: Request) {
  try {
    console.log("Fetching session...")
    const session = await getServerSession(authOptions)
    console.log("Session status:", session ? "authenticated" : "unauthenticated")
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse and log the request body
    const json = await request.json()
    console.log("Received request body:", json)

    // Define the room type schema
    const roomTypeSchema = z.object({
      name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
      }),
      description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
      }),
      descriptionAr: z.string().default(""),
      adultCapacity: z.coerce.number().min(1, {
        message: "Adult capacity must be at least 1.",
      }),
      childCapacity: z.coerce.number().min(0, {
        message: "Child capacity cannot be negative.",
      }),
      basePrice: z.coerce.number().min(0, {
        message: "Base price must be greater than or equal to 0.",
      }),
      extraBedCharge: z.coerce.number().min(0, {
        message: "Extra bed charge must be greater than or equal to 0.",
      }),
      amenities: z.array(z.string()).default([]),
      imageUrl: z.string().url().optional().or(z.literal('')).default(""),
    })

    // Validate and log the data
    const validatedData = roomTypeSchema.parse(json)
    console.log("Validated data:", validatedData)

    console.log("Creating new room type...")
    try {
      // Check if room type with same name exists
      const existingRoomType = await prisma.roomType.findUnique({
        where: {
          name: validatedData.name
        }
      })

      if (existingRoomType) {
        return NextResponse.json(
          { error: "Room type with this name already exists" },
          { status: 400 }
        )
      }

      const createData = {
        name: validatedData.name,
        description: validatedData.description,
        descriptionAr: validatedData.descriptionAr,
        basePrice: validatedData.basePrice,
        adultCapacity: validatedData.adultCapacity,
        childCapacity: validatedData.childCapacity,
        extraBedCharge: validatedData.extraBedCharge,
        amenities: validatedData.amenities,
        imageUrl: validatedData.imageUrl || null,
        status: "ACTIVE"  // Use status field instead of isActive
      }
      
      console.log("Attempting to create with data:", createData)
      
      // Create the room type
      const roomType = await prisma.roomType.create({
        data: createData
      })

      console.log("Successfully created room type:", roomType)
      return NextResponse.json(roomType)
    } catch (prismaError) {
      console.error("Prisma error details:", {
        error: prismaError,
        code: prismaError instanceof Error ? (prismaError as any).code : undefined,
        meta: prismaError instanceof Error ? (prismaError as any).meta : undefined,
      })
      return NextResponse.json(
        { 
          error: "Database error", 
          details: prismaError instanceof Error ? prismaError.message : "Unknown error",
          code: prismaError instanceof Error ? (prismaError as any).code : undefined,
          meta: prismaError instanceof Error ? (prismaError as any).meta : undefined
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in POST /api/room-types:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
