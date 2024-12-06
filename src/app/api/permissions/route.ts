import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const permissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  action: z.enum(["CREATE", "READ", "UPDATE", "DELETE"], {
    required_error: "Action is required",
  }),
  subject: z.string().min(1, "Subject is required"),
})

// GET: Fetch all permissions
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const permissions = await prisma.permission.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(permissions)
  } catch (error) {
    console.error("[PERMISSIONS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// POST: Create a new permission
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedFields = permissionSchema.safeParse(body)

    if (!validatedFields.success) {
      return new NextResponse("Invalid fields", { status: 400 })
    }

    const { name, description, action, subject } = validatedFields.data

    const existingPermission = await prisma.permission.findFirst({
      where: {
        name,
      },
    })

    if (existingPermission) {
      return new NextResponse("Permission already exists", { status: 400 })
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        description,
        action,
        subject,
      },
    })

    return NextResponse.json(permission)
  } catch (error) {
    console.error("[PERMISSIONS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
