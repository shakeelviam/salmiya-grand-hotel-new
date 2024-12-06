import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Validation schema for menu item
const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  price: z.number().positive('Price must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    const where = {
      ...(category && { categoryId: category }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
    }

    const items = await prisma.menuItem.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json({ 
      data: items,
      message: "Menu items retrieved successfully" 
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('Received request body:', body)
    
    try {
      const validatedData = menuItemSchema.parse(body)
      console.log('Validated data:', validatedData)

      // Check if category exists
      const category = await prisma.menuCategory.findUnique({
        where: { id: validatedData.categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { error: "Selected category does not exist" },
          { status: 400 }
        )
      }

      const menuItem = await prisma.menuItem.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          price: validatedData.price,
          categoryId: validatedData.categoryId,
          imageUrl: validatedData.imageUrl,
          isActive: validatedData.isActive,
        },
        include: {
          category: true
        }
      })

      return NextResponse.json({ 
        data: menuItem,
        message: "Menu item created successfully" 
      }, { status: 201 })
    } catch (validationError) {
      console.error('Validation error:', validationError)
      return NextResponse.json(
        { error: "Validation failed", details: validationError },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Menu item ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validatedData = menuItemSchema.partial().parse(body)

    // Check if category exists
    if (validatedData.categoryId) {
      const category = await prisma.menuCategory.findUnique({
        where: { id: validatedData.categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { error: "Selected category does not exist" },
          { status: 400 }
        )
      }
    }

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        categoryId: validatedData.categoryId,
        imageUrl: validatedData.imageUrl,
        isActive: validatedData.isActive,
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({ 
      data: menuItem,
      message: "Menu item updated successfully" 
    })
  } catch (error) {
    console.error('Server error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Menu item ID is required' },
        { status: 400 }
      )
    }

    await prisma.menuItem.delete({
      where: { id },
    })

    return NextResponse.json({ 
      data: null,
      message: "Menu item deleted successfully" 
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    )
  }
}
