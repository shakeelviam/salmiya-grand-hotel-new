import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const task = await prisma.housekeepingTask.findUnique({
      where: {
        id: params.taskId,
      },
    })

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    const updatedTask = await prisma.housekeepingTask.update({
      where: {
        id: params.taskId,
      },
      data: {
        status: task.status === "completed" ? "pending" : "completed",
        completedAt: task.status === "completed" ? null : new Date(),
        completedById: task.status === "completed" ? null : session.user.id,
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("[HOUSEKEEPING_TOGGLE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
