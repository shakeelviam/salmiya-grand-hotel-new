import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withPermission } from "@/lib/permissions"

// GET: Fetch a specific permission
export const GET = withPermission(
  async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const permission = await prisma.permission.findUnique({
        where: { id: params.id },
      })

      if (!permission) {
        return NextResponse.json(
          { error: "Permission not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(permission)
    } catch (error) {
      console.error("Error fetching permission:", error)
      return NextResponse.json(
        { error: "Failed to fetch permission" },
        { status: 500 }
      )
    }
  },
  { action: "READ", subject: "permission" }
)

// PUT: Update a permission
export const PUT = withPermission(
  async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const json = await request.json()

      // Validate required fields
      if (!json.name || !json.action || !json.subject) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        )
      }

      // Check if another permission exists with the same action and subject
      const existingPermission = await prisma.permission.findFirst({
        where: {
          action: json.action,
          subject: json.subject,
          NOT: { id: params.id },
        },
      })

      if (existingPermission) {
        return NextResponse.json(
          { error: "Permission with this action and subject already exists" },
          { status: 400 }
        )
      }

      // Update the permission
      const permission = await prisma.permission.update({
        where: { id: params.id },
        data: {
          name: json.name,
          description: json.description,
          action: json.action,
          subject: json.subject,
        },
      })

      return NextResponse.json(permission)
    } catch (error) {
      console.error("Error updating permission:", error)
      return NextResponse.json(
        { error: "Failed to update permission" },
        { status: 500 }
      )
    }
  },
  { action: "UPDATE", subject: "permission" }
)

// DELETE: Delete a permission
export const DELETE = withPermission(
  async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      // Delete all role permissions first
      await prisma.rolePermission.deleteMany({
        where: { permissionId: params.id },
      })

      // Delete the permission
      await prisma.permission.delete({
        where: { id: params.id },
      })

      return NextResponse.json({ message: "Permission deleted successfully" })
    } catch (error) {
      console.error("Error deleting permission:", error)
      return NextResponse.json(
        { error: "Failed to delete permission" },
        { status: 500 }
      )
    }
  },
  { action: "DELETE", subject: "permission" }
)
