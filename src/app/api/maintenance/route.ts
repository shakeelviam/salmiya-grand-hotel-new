import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const tasks = await prisma.maintenanceTask.findMany({
      include: {
        assignedTo: {
          select: {
            name: true,
          },
        },
        room: {
          select: {
            number: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("[MAINTENANCE_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, description, priority, roomId, assignedToId, dueDate } = body

    const task = await prisma.maintenanceTask.create({
      data: {
        title,
        description,
        priority,
        roomId,
        assignedToId,
        dueDate: new Date(dueDate),
        status: "pending",
        createdById: session.user.id,
      },
      include: {
        assignedTo: {
          select: {
            name: true,
          },
        },
        room: {
          select: {
            number: true,
          },
        },
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("[MAINTENANCE_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
