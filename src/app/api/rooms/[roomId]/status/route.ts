import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { isActive } = await request.json()

    const room = await prisma.room.update({
      where: {
        id: params.roomId,
      },
      data: {
        isActive,
        status: isActive ? 'AVAILABLE' : 'MAINTENANCE'"
      },
      include: {
        roomType: true
      }
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error("[ROOM_STATUS]", error)
    return new NextResponse("Failed to update room status", { status: 500 })
  }
}
