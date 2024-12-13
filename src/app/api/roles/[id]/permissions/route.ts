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
        return new NextResponse("Unauthorized", { status: 401 })
      }

      const roleId = params.id
      const { permissions } = await req.json()

      // Validate permissions array
      if (!Array.isArray(permissions)) {
        return new NextResponse("Invalid permissions format", { status: 400 })
      }

      const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: true,
        },
      })

      if (!role) {
        return new NextResponse("Role not found", { status: 404 })
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })

      if (!user) {
        return new NextResponse("User not found", { status: 404 })
      }

      // Get current permissions for comparison
      const currentPermissions = role.permissions.map(p => `${p.subject}:${p.action}`)
      const newPermissions = permissions.map((p: any) => `${p.subject}:${p.action}`)

      // Find permissions to remove and add
      const toRemove = currentPermissions.filter(p => !newPermissions.includes(p))
      const toAdd = newPermissions.filter(p => !currentPermissions.includes(p))

      // Start a transaction
      await prisma.$transaction(async (tx) => {
        // Create history entries for removed permissions
        await Promise.all(
          toRemove.map(async (p) => {
            const [subject, action] = p.split(":")
            await tx.permissionHistory.create({
              data: {
                roleId,
                userId: user.id,
                action: "REVOKE",
                subject: `${subject}:${action}`,
              },
            })
          })
        )

        // Create history entries for added permissions
        await Promise.all(
          toAdd.map(async (p) => {
            const [subject, action] = p.split(":")
            await tx.permissionHistory.create({
              data: {
                roleId,
                userId: user.id,
                action: "GRANT",
                subject: `${subject}:${action}`,
              },
            })
          })
        )

        // Update role permissions
        await tx.role.update({
          where: { id: roleId },
          data: {
            permissions: {
              disconnect: role.permissions.map(p => ({ id: p.id })), // First remove all permissions
              connect: permissions.map((p: any) => ({
                name: `${p.subject}_${p.action}`, // Use this as a unique identifier
              })),
            },
          },
        })
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("[ROLE_PERMISSIONS_PUT]", error)
      if (error instanceof Error) {
        return new NextResponse(error.message, { status: 500 })
      }
      return new NextResponse("Internal error", { status: 500 })
    }
  },
  { action: "UPDATE", subject: "permission" }
)
