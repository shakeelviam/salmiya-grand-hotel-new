import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const roleId = params.id

    const history = await prisma.permissionHistory.findMany({
      where: {
        roleId,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 50, // Limit to last 50 entries
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(
      history.map((entry) => ({
        action: entry.action,
        subject: entry.subject,
        timestamp: entry.timestamp,
        user: entry.user.name || entry.user.email,
      }))
    )
  } catch (error) {
    console.error("[ROLE_PERMISSION_HISTORY_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
