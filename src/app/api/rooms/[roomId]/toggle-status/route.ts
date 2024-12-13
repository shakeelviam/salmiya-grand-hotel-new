import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roomId } = params
    const { isActive } = await req.json()

    const room = await prisma.room.update({
      where: { id: roomId },
      data: { isActive },
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error("[ROOM_TOGGLE_STATUS]", error)
    return NextResponse.json(
      { error: "Error updating room status" },
      { status: 500 }
    )
  }
}
