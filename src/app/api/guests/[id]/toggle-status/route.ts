import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function PATCH(
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

    const { id } = params
    const { isActive } = await req.json()

    const guest = await prisma.guest.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json({
      data: guest,
      message: `Guest ${isActive ? 'enabled' : 'disabled'} successfully`
    })
  } catch (error) {
    console.error("[GUEST_TOGGLE_STATUS]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
