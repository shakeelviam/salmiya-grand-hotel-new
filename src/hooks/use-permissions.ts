import { useState, useEffect } from "react"
import { PermissionAction } from "@prisma/client"

export type Permission = {
  id: string
  name: string
  description: string | null
  action: PermissionAction
  subject: string
  createdAt: string
  updatedAt: string
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPermissions = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/permissions")
      if (!response.ok) {
        throw new Error("Failed to fetch permissions")
      }
      const data = await response.json()
      setPermissions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const createPermission = async (data: Omit<Permission, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch("/api/permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create permission")
      }

      await fetchPermissions()
      return true
    } catch (err) {
      throw err
    }
  }

  const updatePermission = async (id: string, data: Partial<Permission>) => {
    try {
      const response = await fetch(`/api/permissions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update permission")
      }

      await fetchPermissions()
      return true
    } catch (err) {
      throw err
    }
  }

  const deletePermission = async (id: string) => {
    try {
      const response = await fetch(`/api/permissions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete permission")
      }

      await fetchPermissions()
      return true
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [])

  return {
    permissions,
    loading,
    error,
    refetch: fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
  }
}
