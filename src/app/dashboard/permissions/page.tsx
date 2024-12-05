"use client"

import { useState } from "react"
import { usePermissions, Permission } from "@/hooks/use-permissions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { PermissionForm } from "@/components/forms/permission-form"

export default function PermissionsPage() {
  const { permissions, loading, error, refetch } = usePermissions()
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  function handleEdit(permission: Permission) {
    setSelectedPermission(permission)
    setDialogOpen(true)
  }

  async function handleDelete(id: string) {
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

      refetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete permission",
        variant: "destructive",
      })
    }
  }

  function handleDialogClose() {
    setSelectedPermission(null)
    setDialogOpen(false)
    refetch()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Permissions</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Permission</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedPermission ? "Edit Permission" : "Add Permission"}
              </DialogTitle>
            </DialogHeader>
            <PermissionForm
              permission={selectedPermission || undefined}
              onSuccess={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell>{permission.name}</TableCell>
                <TableCell>{permission.description}</TableCell>
                <TableCell>{permission.action}</TableCell>
                <TableCell>{permission.subject}</TableCell>
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
