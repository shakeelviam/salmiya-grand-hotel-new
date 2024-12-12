import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { checkPermission } from "@/lib/permissions"

const serviceCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["FOOD", "NON_FOOD"]),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const hasPermission = await checkPermission('services', 'update')
    if (!hasPermission) {
      return NextResponse.json(
        { message: "Permission denied" },
        { status: 403 }
      )
    }

    const json = await request.json()
    
    // Validate request body
    const validatedData = serviceCategorySchema.safeParse(json)
    if (!validatedData.success) {
      return NextResponse.json(
        { message: validatedData.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, description, type } = validatedData.data

    const category = await prisma.serviceCategory.update({
      where: { id: params.categoryId },
      data: {
        name,
        description,
        type,
      },
    })

    return NextResponse.json({
      message: "Service category updated successfully",
      data: category
    })
  } catch (error) {
    console.error("[SERVICE_CATEGORIES_PUT]", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const category = await prisma.serviceCategory.findUnique({
      where: { id: params.categoryId },
      include: {
        services: true,
      },
    })

    if (!category) {
      return NextResponse.json(
        { message: "Service category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Service category retrieved successfully",
      data: category
    })
  } catch (error) {
    console.error("[SERVICE_CATEGORIES_GET]", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
