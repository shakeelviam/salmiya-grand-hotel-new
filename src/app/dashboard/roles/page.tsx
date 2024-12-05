'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

export default function RolesPage() {
  const [roles, setRoles] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchRoles() {
      const res = await fetch('/api/roles')
      const data = await res.json()
      setRoles(data)
    }
    fetchRoles()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roles</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Role</Button>
          </DialogTrigger>
          <DialogContent>
            {/* Implement RoleForm here */}
          </DialogContent>
        </Dialog>
      </div>
      <ul>
        {roles.map((role) => (
          <li key={role.id} className="mb-4">
            <p className="font-bold">{role.name}</p>
            <p className="text-gray-600">Permissions: {role.permissions.join(', ')}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
