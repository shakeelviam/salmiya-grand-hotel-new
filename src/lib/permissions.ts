import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { PermissionAction } from "@prisma/client"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export type Permission = {
  action: PermissionAction
  subject: string
}

export async function checkPermission(
  action: PermissionAction,
  subject: string
): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return false

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) return false

    // Admins have all permissions
    if (user.role === "ADMIN") return true

    // For now, grant basic permissions to all authenticated users
    // You can make this more granular later
    if (user.role === "MANAGER") {
      return true
    }

    // Staff can read most things
    if (user.role === "STAFF" && action === "READ") {
      return true
    }

    return false
  } catch (error) {
    console.error("Permission check error:", error)
    return false
  }
}

export function withPermission(handler: Function, permission: Permission) {
  return async function (req: Request, context: any) {
    try {
      const hasPermission = await checkPermission(permission.action, permission.subject)

      if (!hasPermission) {
        return NextResponse.json(
          { error: "Unauthorized: Insufficient permissions" },
          { status: 403 }
        )
      }

      return await handler(req, context)
    } catch (error) {
      console.error("Permission check error:", error)
      return NextResponse.json(
        { error: "Internal server error during permission check" },
        { status: 500 }
      )
    }
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
