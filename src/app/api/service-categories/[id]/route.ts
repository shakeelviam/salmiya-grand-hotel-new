import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const serviceCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  type: z.enum(["FOOD", "NON_FOOD"]),
})

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify the category exists first
    const existingCategory = await prisma.serviceCategory.findUnique({
      where: { id: params.id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Service category not found" },
        { status: 404 }
      )
    }

    const body = await req.json()
    console.log('Received body:', body)
    
    // If it's a toggle active status request
    if ('isActive' in body) {
      const category = await prisma.serviceCategory.update({
        where: { id: params.id },
        data: { isActive: body.isActive },
      })
      return NextResponse.json({
        data: category,
        message: `Service category ${body.isActive ? 'enabled' : 'disabled'} successfully`
      })
    }

    // If it's an update request
    const validatedData = serviceCategorySchema.safeParse(body)
    if (!validatedData.success) {
      console.error('Validation error:', validatedData.error)
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      )
    }

    console.log('Validated data:', validatedData.data)

    const category = await prisma.serviceCategory.update({
      where: { id: params.id },
      data: {
        name: validatedData.data.name,
        description: validatedData.data.description,
        type: validatedData.data.type,
      },
      include: {
        services: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    })

    return NextResponse.json({
      data: category,
      message: "Service category updated successfully"
    })

  } catch (error) {
    console.error("Error updating service category:", error)
    return NextResponse.json(
      { error: "Failed to update service category" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const category = await prisma.serviceCategory.findUnique({
      where: { id: params.id },
      include: {
        services: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: "Service category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: category })
  } catch (error) {
    console.error("Error fetching service category:", error)
    return NextResponse.json(
      { error: "Failed to fetch service category" },
      { status: 500 }
    )
  }
}
