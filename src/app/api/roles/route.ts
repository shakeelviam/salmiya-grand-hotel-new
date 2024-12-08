import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"

// Validation schema for role
const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  permissions: z.array(z.string()).optional(),
})

// GET: Fetch all roles
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(roles)
  } catch (error) {
    console.error("[ROLES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// POST: Create a new role
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedFields = roleSchema.safeParse(body)

    if (!validatedFields.success) {
      return new NextResponse("Invalid fields", { status: 400 })
    }

    const { name, description, permissions } = validatedFields.data

    const existingRole = await prisma.role.findFirst({
      where: {
        name,
      },
    })

    if (existingRole) {
      return new NextResponse("Role already exists", { status: 400 })
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          connect: permissions?.map((id) => ({ id })) || [],
        },
      },
      include: {
        permissions: true,
      },
    })

    return NextResponse.json(role)
  } catch (error) {
    console.error("[ROLES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
