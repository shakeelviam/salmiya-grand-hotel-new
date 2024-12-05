import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
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
    const roomType = await prisma.roomType.update({
      where: { id: params.id },
      data: {
        name: json.name,
        description: json.description,
        adultCapacity: json.adultCapacity,
        childCapacity: json.childCapacity,
        basePrice: json.basePrice,
        extraBedPrice: json.extraBedPrice,
      }
    })

    return NextResponse.json(roomType)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update room type" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await prisma.roomType.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Room type deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete room type" },
      { status: 500 }
    )
  }
}
