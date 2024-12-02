import { useSession } from "next-auth/react"
import { hasPermission, getResourcePermissions, type ResourcePermissions, type Permission } from "@/lib/permissions"

export function usePermissions() {
  const { data: session } = useSession()
  const role = session?.user?.role

  return {
    can: (resource: keyof ResourcePermissions, action: keyof Permission) =>
      hasPermission(role, resource, action),
    getPermissions: (resource: keyof ResourcePermissions) =>
      getResourcePermissions(role, resource),
    role,
  }
}
