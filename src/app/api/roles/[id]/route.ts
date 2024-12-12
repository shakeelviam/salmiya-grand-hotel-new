import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"

const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  permissions: z.array(z.string()).optional(),
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
      return new NextResponse("Role id is required", { status: 400 })
    }

    const role = await prisma.role.findUnique({
      where: {
        id: params.id,
      },
      include: {
        permissions: true,
      },
    })

    return NextResponse.json(role)
  } catch (error) {
    console.error("[ROLE_GET]", error)
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
    const validatedFields = roleSchema.safeParse(body)

    if (!validatedFields.success) {
      return new NextResponse("Invalid fields", { status: 400 })
    }

    if (!params.id) {
      return new NextResponse("Role id is required", { status: 400 })
    }

    const { name, description, permissions } = validatedFields.data

    const existingRole = await prisma.role.findFirst({
      where: {
        name,
        NOT: {
          id: params.id,
        },
      },
    })

    if (existingRole) {
      return new NextResponse("Role already exists", { status: 400 })
    }

    const role = await prisma.role.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
        permissions: {
          set: permissions?.map((id) => ({ id })) || [],
        },
      },
      include: {
        permissions: true,
      },
    })

    return NextResponse.json(role)
  } catch (error) {
    console.error("[ROLE_PUT]", error)
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
      return new NextResponse("Role id is required", { status: 400 })
    }

    const role = await prisma.role.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json(role)
  } catch (error) {
    console.error("[ROLE_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
