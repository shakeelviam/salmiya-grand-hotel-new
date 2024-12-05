import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withPermission } from "@/lib/permissions"
import { hash } from "bcryptjs"

// GET: Fetch a specific user
export const GET = withPermission(
  async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      })

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(user)
    } catch (error) {
      console.error("Error fetching user:", error)
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      )
    }
  },
  { action: "READ", subject: "user" }
)

// PUT: Update a user
export const PUT = withPermission(
  async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const json = await request.json()

      // Validate required fields
      if (!json.name || !json.email || !json.role) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        )
      }

      // Check if email is taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email: json.email,
          NOT: { id: params.id },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 400 }
        )
      }

      // Prepare update data
      const updateData: any = {
        name: json.name,
        email: json.email,
        role: json.role,
        isActive: json.isActive,
      }

      // If password is provided, hash it
      if (json.password) {
        updateData.hashedPassword = await hash(json.password, 12)
      }

      // Update the user
      const user = await prisma.user.update({
        where: { id: params.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      // If permissions are provided, update role permissions
      if (json.permissions && Array.isArray(json.permissions)) {
        // Delete existing permissions
        await prisma.rolePermission.deleteMany({
          where: { userId: params.id },
        })

        // Create new permissions
        await prisma.rolePermission.createMany({
          data: json.permissions.map((permissionId: string) => ({
            userId: params.id,
            permissionId,
          })),
        })
      }

      return NextResponse.json(user)
    } catch (error) {
      console.error("Error updating user:", error)
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      )
    }
  },
  { action: "UPDATE", subject: "user" }
)

// DELETE: Delete a user
export const DELETE = withPermission(
  async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      // Delete user's role permissions first
      await prisma.rolePermission.deleteMany({
        where: { userId: params.id },
      })

      // Delete the user
      await prisma.user.delete({
        where: { id: params.id },
      })

      return NextResponse.json({ message: "User deleted successfully" })
    } catch (error) {
      console.error("Error deleting user:", error)
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      )
    }
  },
  { action: "DELETE", subject: "user" }
)

// PATCH: Toggle user active status
export const PATCH = withPermission(
  async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const { isActive } = await request.json()

      const user = await prisma.user.update({
        where: { id: params.id },
        data: { isActive },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return NextResponse.json({
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
        user,
      })
    } catch (error) {
      console.error("Error updating user status:", error)
      return NextResponse.json(
        { error: "Failed to update user status" },
        { status: 500 }
      )
    }
  },
  { action: "UPDATE", subject: "user" }
)
