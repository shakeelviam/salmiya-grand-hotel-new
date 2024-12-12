import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { PermissionAction } from "@prisma/client"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export type Permission = {
  action: PermissionAction
  subject: string
}

export async function checkPermission(
  userId: string,
  permissionName: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true
          }
        }
      }
    })

    if (!user) return false

    // Check if user has admin role
    const isAdmin = user.roles.some(role => role.name === "ADMIN")
    if (isAdmin) return true

    // Check if user has the specific permission through any of their roles
    const hasPermission = user.roles.some(role =>
      role.permissions.some(permission => permission.name === permissionName)
    )

    return hasPermission
  } catch (error) {
    console.error("Permission check error:", error)
    return false
  }
}

export async function checkPermissions(action: PermissionAction) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return false
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      roles: {
        include: {
          permissions: true
        }
      }
    }
  })

  if (!user) return false

  // Admin has all permissions
  if (user.roles.some(role => role.name === "ADMIN")) {
    return true
  }

  // Check if any of the user's roles have the required permission
  return user.roles.some(role =>
    role.permissions.some(permission => permission.action === action)
  )
}

export function withPermission(handler: Function, permission: Permission) {
  return async (req: Request, context: any) => {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasPermission = await checkPermissions(permission.action)
    if (!hasPermission) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    return handler(req, context)
  }
}

export function requirePermissions(action: PermissionAction) {
  return async (req: Request) => {
    const hasPermission = await checkPermissions(action)
    if (!hasPermission) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }
    return NextResponse.next()
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
    { action: "CREATE", subject: "reservations" },
    { action: "READ", subject: "reservations" },
    { action: "UPDATE", subject: "reservations" },
    { action: "CREATE", subject: "rooms" },
    { action: "READ", subject: "rooms" },
    { action: "UPDATE", subject: "rooms" },
    { action: "CREATE", subject: "payments" },
    { action: "READ", subject: "payments" },
    { action: "UPDATE", subject: "payments" },
  ],
  STAFF: [
    { action: "READ", subject: "reservations" },
    { action: "READ", subject: "rooms" },
    { action: "READ", subject: "payments" },
  ],
}
