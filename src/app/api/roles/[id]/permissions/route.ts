import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPermission } from "@/lib/permissions"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET: Fetch permissions for a role
export const GET = withPermission(
  async function GET(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const role = await prisma.role.findUnique({
        where: { id: params.id },
        include: {
          permissions: {
            select: {
              id: true,
              name: true,
              action: true,
              subject: true,
            },
          },
        },
      })

      if (!role) {
        return NextResponse.json(
          { error: 'Role not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(role.permissions)
    } catch (error) {
      console.error('Error fetching role permissions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch role permissions' },
        { status: 500 }
      )
    }
  },
  { action: "READ", subject: "permission" }
)

// PUT: Update permissions for a role
export const PUT = withPermission(
  async function PUT(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const roleId = params.id
      const { permissions } = await req.json()

      // Validate permissions array
      if (!Array.isArray(permissions)) {
        return NextResponse.json({ error: "Invalid permissions format" }, { status: 400 })
      }

      const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: true,
        },
      })

      if (!role) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 })
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Get current permissions for comparison
      const currentPermissions = role.permissions.map(p => `${p.subject}:${p.action}`)
      const newPermissions = permissions.map((p: any) => `${p.subject}:${p.action}`)

      // Find permissions to remove and add
      const toRemove = currentPermissions.filter(p => !newPermissions.includes(p))
      const toAdd = newPermissions.filter(p => !currentPermissions.includes(p))

      // Start a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Remove old permissions
        if (toRemove.length > 0) {
          await tx.role.update({
            where: { id: roleId },
            data: {
              permissions: {
                deleteMany: {
                  OR: toRemove.map(p => {
                    const [subject, action] = p.split(':')
                    return { subject, action }
                  })
                }
              }
            }
          })
        }

        // Add new permissions
        if (toAdd.length > 0) {
          await tx.role.update({
            where: { id: roleId },
            data: {
              permissions: {
                create: toAdd.map(p => {
                  const [subject, action] = p.split(':')
                  return {
                    name: `${role.name}:${subject}:${action}`,
                    subject,
                    action
                  }
                })
              }
            }
          })
        }

        // Create history entries
        await tx.permissionHistory.createMany({
          data: [
            ...toRemove.map(p => {
              const [subject, action] = p.split(':')
              return {
                roleId,
                userId: user.id,
                action: 'REMOVED',
                details: `Removed ${action} permission for ${subject}`,
              }
            }),
            ...toAdd.map(p => {
              const [subject, action] = p.split(':')
              return {
                roleId,
                userId: user.id,
                action: 'ADDED',
                details: `Added ${action} permission for ${subject}`,
              }
            })
          ]
        })

        return { added: toAdd.length, removed: toRemove.length }
      })

      return NextResponse.json({
        message: 'Permissions updated successfully',
        changes: result
      })
    } catch (error) {
      console.error('Error updating role permissions:', error)
      return NextResponse.json(
        { error: 'Failed to update role permissions' },
        { status: 500 }
      )
    }
  },
  { action: "UPDATE", subject: "permission" }
)
