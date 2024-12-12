import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkPermission } from "@/lib/permissions"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const hasPermission = await checkPermission('services', 'update')
    if (!hasPermission) {
      return NextResponse.json(
        { message: "Permission denied" },
        { status: 403 }
      )
    }

    const { isActive } = await request.json()

    const service = await prisma.service.update({
      where: { id: params.serviceId },
      data: { isActive }
    })

    return NextResponse.json({
      message: `Service ${isActive ? 'enabled' : 'disabled'} successfully`,
      data: service
    })
  } catch (error) {
    console.error('Error updating service status:', error)
    return NextResponse.json(
      { message: "Failed to update service status" },
      { status: 500 }
    )
  }
}
