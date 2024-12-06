"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { RolePermissionForm } from "@/components/forms/role-permission-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Role = {
  id: string
  name: string
  description?: string
}

export default function RolePermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch roles when component mounts
  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      if (!response.ok) throw new Error('Failed to fetch roles')
      const data = await response.json()
      setRoles(data)
      if (data.length > 0) {
        setSelectedRole(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId)
  }

  const handlePermissionsUpdated = () => {
    toast({
      title: "Success",
      description: "Permissions updated successfully",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Permissions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span>Select Role:</span>
              <Select value={selectedRole} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedRole && (
            <RolePermissionForm
              roleId={selectedRole}
              roleName={roles.find(r => r.id === selectedRole)?.name || ""}
              onSuccess={handlePermissionsUpdated}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
