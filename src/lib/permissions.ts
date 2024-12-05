import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { PermissionAction } from "@prisma/client"

export type Permission = {
  action: PermissionAction
  subject: string
}

export async function checkPermission(
  action: PermissionAction,
  subject: string
): Promise<boolean> {
  const session = await getServerSession()
  if (!session?.user?.email) return false

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  })

  if (!user) return false

  // Admins have all permissions
  if (user.role === "ADMIN") return true

  // Check if user has the specific permission
  return user.rolePermissions.some(
    (rp) => rp.permission.action === action && rp.permission.subject === subject
  )
}

// Updated withPermission function
export async function withPermission(handler: Function, permission: Permission) {
  return async function (req: Request, context: any) {
    const hasPermission = await checkPermission(permission.action, permission.subject)

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Unauthorized: Insufficient permissions" },
        { status: 403 }
      )
    }

    // Properly await the handler's result
    return await handler(req, context)
  }
}

// Default permissions for each role
export const defaultPermissions = {
  ADMIN: [
    { action: "CREATE", subject: "all" },
    { action: "READ", subject: "all" },
    { action: "UPDATE", subject: "all" },
    { action: "DELETE", subject: "all" },
  ],
  MANAGER: [
    { action: "CREATE", subject: "room" },
    { action: "READ", subject: "room" },
    { action: "UPDATE", subject: "room" },
    { action: "CREATE", subject: "roomType" },
    { action: "READ", subject: "roomType" },
    { action: "UPDATE", subject: "roomType" },
    { action: "CREATE", subject: "reservation" },
    { action: "READ", subject: "reservation" },
    { action: "UPDATE", subject: "reservation" },
    { action: "CREATE", subject: "payment" },
    { action: "READ", subject: "payment" },
    { action: "UPDATE", subject: "payment" },
  ],
  STAFF: [
    { action: "READ", subject: "room" },
    { action: "READ", subject: "roomType" },
    { action: "CREATE", subject: "reservation" },
    { action: "READ", subject: "reservation" },
    { action: "UPDATE", subject: "reservation" },
    { action: "CREATE", subject: "payment" },
    { action: "READ", subject: "payment" },
  ],
} as const
