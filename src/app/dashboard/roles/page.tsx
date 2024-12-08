"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { RoleForm } from "@/components/forms/role-form"
import { RolesTable } from "@/components/tables/roles-table"

export default function RolesPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
          <p className="text-sm text-muted-foreground">
            Manage user roles and permissions here
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Add a new role with specific permissions
              </DialogDescription>
            </DialogHeader>
            <RoleForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-6">
        <RolesTable />
      </div>
    </div>
  )
}
