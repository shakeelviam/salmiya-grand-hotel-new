import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function PATCH(
  req: Request,
  { params }: { params: { expenseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const expense = await prisma.expense.findUnique({
      where: {
        id: params.expenseId,
      },
    })

    if (!expense) {
      return new NextResponse("Expense not found", { status: 404 })
    }

    const updatedExpense = await prisma.expense.update({
      where: {
        id: params.expenseId,
      },
      data: {
        status: expense.status === "approved" ? "pending" : "approved",
      },
    })

    return NextResponse.json(updatedExpense)
  } catch (error) {
    console.error("[EXPENSE_TOGGLE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
