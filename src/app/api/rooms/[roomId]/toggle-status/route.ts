import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const { isActive } = json

    const room = await prisma.room.update({
      where: { id: params.roomId },
      data: { 
        isActive,
        // When disabling a room, also make it unavailable
        isAvailable: isActive ? true : false,
        // When disabling a room, set status to MAINTENANCE
        status: isActive ? 'AVAILABLE' : 'MAINTENANCE'
      }
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error("[ROOM_TOGGLE_STATUS] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
