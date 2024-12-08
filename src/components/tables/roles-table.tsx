import { useState, useEffect } from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ActionButtons } from "@/components/ui/action-buttons"
import { useToast } from "@/components/ui/use-toast"

interface Role {
  id: string
  name: string
  description: string
  isActive: boolean
}

export function RolesTable() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/roles")
        if (!response.ok) {
          throw new Error("Failed to fetch roles")
        }
        const data = await response.json()
        setRoles(data)
      } catch (error) {
        console.error("Error fetching roles:", error)
        toast({
          title: "Error",
          description: "Failed to load roles",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [toast])

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/roles/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update role status")
      }

      setRoles(roles.map(role => 
        role.id === id ? { ...role, isActive: !isActive } : role
      ))

      toast({
        title: "Success",
        description: `Role ${isActive ? "disabled" : "enabled"} successfully`,
      })
    } catch (error) {
      console.error("Error updating role status:", error)
      toast({
        title: "Error",
        description: "Failed to update role status",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading roles...</div>
  }

  if (roles.length === 0) {
    return <div>No roles found. Create one to get started.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="font-medium">{role.name}</TableCell>
            <TableCell>{role.description}</TableCell>
            <TableCell>
              <Badge variant={role.isActive ? "success" : "destructive"}>
                {role.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <ActionButtons
                onView={() => {}}
                onEdit={() => {}}
                onToggle={() => handleToggleStatus(role.id, role.isActive)}
                isActive={role.isActive}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
