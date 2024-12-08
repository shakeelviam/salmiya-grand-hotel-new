import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get("categoryId")

    const services = await prisma.service.findMany({
      where: {
        ...(categoryId && { categoryId }),
        type: "FOOD",
        isEnabled: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({ data: services })
  } catch (error) {
    console.error("[ROOM_SERVICE_ITEMS_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const json = await req.json()
    const { name, description, price, categoryId } = json

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price,
        categoryId,
        type: "FOOD",
        isEnabled: true,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("[ROOM_SERVICE_ITEMS_POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
