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

    const expenses = await prisma.expense.findMany({
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("[EXPENSES_GET]", error)
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
    const { category, description, amount, date } = body

    const expense = await prisma.expense.create({
      data: {
        category,
        description,
        amount,
        date: new Date(date),
        status: "pending",
        createdById: session.user.id,
      },
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error("[EXPENSES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
