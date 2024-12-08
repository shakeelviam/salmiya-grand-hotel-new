import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
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
    const categoryId = searchParams.get("categoryId")

    const services = await prisma.service.findMany({
      where: {
        ...(categoryId && { categoryId }),
        ...(type && {
          category: {
            type
          }
        }),
      },
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({
      data: services,
      message: "Services retrieved successfully"
    })
  } catch (error) {
    console.error("[SERVICES_GET]", error)
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
    const validatedData = serviceSchema.safeParse(json)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, description, price, categoryId, isActive } = validatedData.data

    // Verify category exists
    const category = await prisma.serviceCategory.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price,
        categoryId,
        isActive,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("[SERVICES_POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
