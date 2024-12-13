import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const categories = await prisma.menuCategory.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({ data: categories })
  } catch (error) {
    console.error("Error fetching categories:", error) // Debug log
    
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: [{ 
          message: error instanceof Error ? error.message : "Unknown error",
          ...(error instanceof Error && { stack: error.stack })
        }]
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // 1. Check session
    const session = await getServerSession(authOptions)
    console.log("Session data:", {
      session,
      user: session?.user,
      email: session?.user?.email
    })

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Please sign in to manage menu categories" },
        { status: 401 }
      )
    }

    // 2. Get user with roles
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { roles: true }
    })
    console.log("User data:", {
      id: user?.id,
      email: user?.email,
      roles: user?.roles.map(r => r.name)
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      )
    }

    // 3. Parse request body
    let body
    try {
      body = await req.json()
      console.log("Request body:", body)
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json(
        { error: "Invalid request body", details: [{ message: "Invalid JSON" }] },
        { status: 400 }
      )
    }

    // 4. Validate request data
    const { name, description, isActive } = body
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required and must be a string", details: [{ message: "Category name is required" }] },
        { status: 400 }
      )
    }

    // 5. Check for existing category
    try {
      const existingCategory = await prisma.menuCategory.findFirst({
        where: { 
          name: {
            equals: name.trim(),
            mode: 'insensitive'"
          }
        },
      })
      console.log("Existing category check:", existingCategory)

      if (existingCategory) {
        return NextResponse.json(
          { error: `A category with the name "${name}" already exists` },
          { status: 409 }
        )
      }
    } catch (error) {
      console.error("Error checking existing category:", error)
      return NextResponse.json(
        { error: "Database error while checking category name", details: [{ message: "Please try again" }] },
        { status: 503 }
      )
    }

    // 6. Create category
    try {
      const categoryData = {
        name: name.trim(),
        description: description?.trim() || null,
        isActive: isActive ?? true,
      }
      console.log("Category data to create:", categoryData)

      const category = await prisma.menuCategory.create({
        data: categoryData,
      })
      console.log("Created category:", category)

      return NextResponse.json({ 
        data: category,
        message: `Category ${name} has been created successfully`
      })
    } catch (error) {
      console.error("Error creating category:", error)
      
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        })

        if (error.message.includes('Unique constraint')) {
          return NextResponse.json(
            { error: "A category with this name already exists" },
            { status: 409 }
          )
        }

        if (error.message.includes('connect')) {
          return NextResponse.json(
            { error: "Database connection error", details: [{ message: "Please try again later" }] },
            { status: 503 }
          )
        }
      }
      
      return NextResponse.json(
        { 
          error: "Failed to create category", 
          details: [{ 
            message: error instanceof Error ? error.message : "Unknown error",
            ...(error instanceof Error && { stack: error.stack })
          }]
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Unhandled error:", error)
    
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: [{ 
          message: error instanceof Error ? error.message : "An unexpected error occurred",
          ...(error instanceof Error && { stack: error.stack })
        }]
      },
      { status: 500 }
    )
  }
}
