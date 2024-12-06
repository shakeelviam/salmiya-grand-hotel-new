import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = parseFloat(formData.get("price") as string)
    const categoryId = formData.get("categoryId") as string
    const isActive = formData.get("isActive") === "true"
    const imageFile = formData.get("image") as File | null

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
    })

    if (!menuItem) {
      return new NextResponse("Menu item not found", { status: 404 })
    }

    // Handle image upload if a new image is provided
    let imageUrl = menuItem.imageUrl
    if (imageFile) {
      // TODO: Implement image upload logic here
      // For now, we'll keep the existing image
    }

    const updatedMenuItem = await prisma.menuItem.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
        price,
        categoryId,
        isActive,
        imageUrl,
      },
    })

    return NextResponse.json(updatedMenuItem)
  } catch (error) {
    console.error("[MENU_ITEM_UPDATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
