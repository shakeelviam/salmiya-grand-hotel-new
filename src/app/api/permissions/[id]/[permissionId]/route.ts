import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

const permissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  action: z.enum(["CREATE", "READ", "UPDATE", "DELETE"], {
    required_error: "Action is required",
  }),
  subject: z.string().min(1, "Subject is required"),
})

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Permission id is required", { status: 400 })
    }

    const permission = await prisma.permission.findUnique({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json(permission)
  } catch (error) {
    console.error("[PERMISSION_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    if (!params.id) {
      return new NextResponse("Permission id is required", { status: 400 })
    }

    const { name, description, action, subject } = validatedFields.data

    const existingPermission = await prisma.permission.findFirst({
      where: {
        name,
        NOT: {
          id: params.id,
        },
      },
    })

    if (existingPermission) {
      return new NextResponse("Permission already exists", { status: 400 })
    }

    const permission = await prisma.permission.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
        action,
        subject,
      },
    })

    return NextResponse.json(permission)
  } catch (error) {
    console.error("[PERMISSION_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Permission id is required", { status: 400 })
    }

    const permission = await prisma.permission.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json(permission)
  } catch (error) {
    console.error("[PERMISSION_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
