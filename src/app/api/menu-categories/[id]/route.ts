import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { name, description, isActive } = body

    const category = await prisma.menuCategory.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
        isActive,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("[MENU_CATEGORY_UPDATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
