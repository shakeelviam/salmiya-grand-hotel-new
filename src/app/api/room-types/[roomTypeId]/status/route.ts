import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function PATCH(
  request: Request,
  { params }: { params: { roomTypeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const json = await request.json()
    const { isActive } = json

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      )
    }

    const roomType = await prisma.roomType.update({
      where: { id: params.roomTypeId },
      data: { status: isActive ? 'ACTIVE' : 'DISABLED' }
    })

    return NextResponse.json({ roomType })
  } catch (error) {
    console.error("Error updating room type status:", error)
    return NextResponse.json(
      { error: "Failed to update room type status" },
      { status: 500 }
    )
  }
}
