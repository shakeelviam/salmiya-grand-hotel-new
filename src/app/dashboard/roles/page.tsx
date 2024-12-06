"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { RoleForm } from "@/components/forms/role-form"

type Role = {
  id: string
  name: string
  description: string
  permissions: {
    id: string
    name: string
    action: string
    subject: string
  }[]
  createdAt: string
  updatedAt: string
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/roles')
      if (!response.ok) throw new Error('Failed to fetch roles')
      const data = await response.json()
      setRoles(data)
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

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleRoleCreated = () => {
    setIsDialogOpen(false)
    fetchRoles()
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
        <h1 className="text-2xl font-bold">Roles</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <RoleForm onSuccess={handleRoleCreated} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((permission) => (
                      <Badge key={permission.id} variant="secondary">
                        {permission.action} {permission.subject}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
