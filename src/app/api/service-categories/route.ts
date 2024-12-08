import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const serviceCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["FOOD", "NON_FOOD"]),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")

    const categories = await prisma.serviceCategory.findMany({
      where: {
        ...(type && { type }),
      },
      include: {
        services: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({
      data: categories,
      message: "Service categories retrieved successfully"
    })
  } catch (error) {
    console.error("[SERVICE_CATEGORIES_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const json = await req.json()
    
    // Validate request body
    const validatedData = serviceCategorySchema.safeParse(json)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, description, type } = validatedData.data

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        description,
        type,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("[SERVICE_CATEGORIES_POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
