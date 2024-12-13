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
import { PermissionForm } from "@/components/forms/permission-form"

type Permission = {
  id: string
  name: string
  description: string | null
  action: string
  subject: string
  createdAt: string
  updatedAt: string
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const { toast } = useToast()

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/permissions')
      if (!response.ok) throw new Error('Failed to fetch permissions')
      const data = await response.json()
      setPermissions(data)
    } catch (error) {
      console.error('Error fetching permissions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch permissions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [])

  const handlePermissionCreated = () => {
    setIsDialogOpen(false)
    fetchPermissions()
  }

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'bg-green-100 text-green-800'"
      case 'READ':
        return 'bg-blue-100 text-blue-800'"
      case 'UPDATE':
        return 'bg-yellow-100 text-yellow-800'"
      case 'DELETE':
        return 'bg-red-100 text-red-800'"
      default:
        return 'bg-gray-100 text-gray-800'"
    }
  }

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this permission?")) {
      return
    }

    try {
      const response = await fetch(`/api/permissions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete permission")
      }

      toast({
        title: "Success",
        description: "Permission deleted successfully",
      })

      fetchPermissions()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete permission",
        variant: "destructive",
      })
    }
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
        <h1 className="text-2xl font-bold">Permissions</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {selectedPermission ? 'Edit Permission' : 'Add Permission'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedPermission ? 'Edit Permission' : 'Create New Permission'}</DialogTitle>
            </DialogHeader>
            <PermissionForm
              permission={selectedPermission || undefined}
              onSuccess={handlePermissionCreated}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium">{permission.name}</TableCell>
                <TableCell>{permission.description}</TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary"
                    className={getActionColor(permission.action)}
                  >
                    {permission.action}
                  </Badge>
                </TableCell>
                <TableCell>{permission.subject}</TableCell>
                <TableCell>{new Date(permission.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(permission)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(permission.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
