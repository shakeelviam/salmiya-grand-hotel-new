"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, History, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Define permission types by category with descriptions
const PERMISSION_CATEGORIES = {
  "User Management": {
    resources: ["users", "roles", "permissions"],
    description: "Manage system users, roles, and their permissions",
    permissions: {
      users: "Control user accounts and access",
      roles: "Define and manage user roles",
      permissions: "Configure role-based permissions"
    }
  },
  "Hotel Operations": {
    resources: [
      "rooms",
      "room-types",
      "reservations",
      "room-service",
      "services",
      "service-categories"
    ],
    description: "Manage core hotel operations",
    permissions: {
      rooms: "Manage room inventory and status",
      "room-types": "Configure room categories and pricing",
      reservations: "Handle guest reservations and check-ins",
      "room-service": "Manage room service orders",
      services: "Configure hotel services",
      "service-categories": "Manage service categories"
    }
  },
  "Food and Beverage": {
    resources: ["menu-categories", "menu-items", "kitchen"],
    description: "Manage restaurant and food service operations",
    permissions: {
      "menu-categories": "Manage menu categories",
      "menu-items": "Manage menu items and pricing",
      kitchen: "Handle food preparation and orders"
    }
  },
  "Finance": {
    resources: ["payments", "bills", "reports"],
    description: "Handle financial operations and reporting",
    permissions: {
      payments: "Process and manage payments",
      bills: "Handle guest bills and invoices",
      reports: "Access and generate financial reports"
    }
  },
  "System": {
    resources: ["settings"],
    description: "System configuration and maintenance",
    permissions: {
      settings: "Configure system-wide settings"
    }
  }
} as const

const ACTIONS = {
  create: "Add new records",
  read: "View existing records",
  update: "Modify existing records",
  delete: "Remove records"
} as const

type Permission = {
  id: string
  name: string
  action: string
  subject: string
  createdAt?: string
  updatedAt?: string
}

type PermissionMap = {
  [key: string]: boolean
}

type RolePermissionFormProps = {
  roleId: string
  roleName: string
  onSuccess?: () => void
}

type PermissionHistory = {
  action: string
  subject: string
  timestamp: string
  user: string
}

export function RolePermissionForm({ 
  roleId, 
  roleName, 
  onSuccess 
}: RolePermissionFormProps) {
  const [permissions, setPermissions] = useState<PermissionMap>({})
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [compareRoleId, setCompareRoleId] = useState<string>("")
  const [comparePermissions, setComparePermissions] = useState<PermissionMap>({})
  const [history, setHistory] = useState<PermissionHistory[]>([])
  const [availableRoles, setAvailableRoles] = useState<Array<{ id: string, name: string }>>([])
  const { toast } = useToast()

  // Fetch available roles for comparison
  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch('/api/roles')
      if (!response.ok) throw new Error('Failed to fetch roles')
      const data = await response.json()
      setAvailableRoles(data.filter((role: any) => role.id !== roleId))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load available roles"
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
    }
  }, [roleId, toast])

  // Fetch permission history
  const fetchHistory = useCallback(async () => {
    if (!roleId) return setHistory([])
    
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions/history`, {
        credentials: "include"
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch permission history")
      }
      
      setHistory(Array.isArray(result.data) ? result.data : [])
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load permission history"
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
      setHistory([])
    }
  }, [roleId, toast])

  // Fetch permissions for comparison
  const fetchComparePermissions = useCallback(async (compareId: string) => {
    if (!compareId) return
    try {
      const response = await fetch(`/api/roles/${compareId}/permissions`, {
        credentials: "include"
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch comparison permissions")
      }
      
      const permissionMap: PermissionMap = {}
      result.data.forEach((permission: Permission) => {
        const key = `${permission.subject}:${permission.action}`
        permissionMap[key] = true
      })
      
      setComparePermissions(permissionMap)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load comparison permissions"
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
    }
  }, [toast])

  // Fetch existing permissions
  const fetchPermissions = useCallback(async () => {
    if (!roleId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/roles/${roleId}/permissions`, {
        credentials: "include"
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch permissions")
      }
      
      const permissionMap: PermissionMap = {}
      result.data.forEach((permission: Permission) => {
        const key = `${permission.subject}:${permission.action}`
        permissionMap[key] = true
      })
      
      setPermissions(permissionMap)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load permissions"
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [roleId, toast])

  useEffect(() => {
    fetchPermissions()
    fetchRoles()
    fetchHistory()
  }, [fetchPermissions, fetchRoles, fetchHistory])

  useEffect(() => {
    if (compareRoleId) {
      fetchComparePermissions(compareRoleId)
    }
  }, [compareRoleId, fetchComparePermissions])

  const handlePermissionChange = useCallback((subject: string, action: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [`${subject}:${action}`]: checked
    }))
  }, [])

  const handleRowSelect = useCallback((subject: string, checked: boolean) => {
    setPermissions(prev => {
      const newPermissions = { ...prev }
      Object.keys(ACTIONS).forEach(action => {
        newPermissions[`${subject}:${action}`] = checked
      })
      return newPermissions
    })
  }, [])

  const handleColumnSelect = useCallback((action: string, checked: boolean) => {
    setPermissions(prev => {
      const newPermissions = { ...prev }
      Object.values(PERMISSION_CATEGORIES).forEach(category => {
        category.resources.forEach(subject => {
          newPermissions[`${subject}:${action}`] = checked
        })
      })
      return newPermissions
    })
  }, [])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const permissionsToSave = Object.entries(permissions)
        .filter(([_, value]) => value)
        .map(([key]) => {
          const [subject, action] = key.split(':')
          return { subject, action }
        })

      const response = await fetch(`/api/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions: permissionsToSave }),
        credentials: "include"
      })

      if (!response.ok) throw new Error('Failed to update permissions')

      toast({
        title: "Success",
        description: "Permissions updated successfully",
      })

      // Refresh history after update
      fetchHistory()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update permissions"
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const applyTemplate = useCallback((template: string) => {
    const templates = {
      "full_access": () => {
        const newPermissions: PermissionMap = {}
        Object.values(PERMISSION_CATEGORIES).forEach(category => {
          category.resources.forEach(subject => {
            Object.keys(ACTIONS).forEach(action => {
              newPermissions[`${subject}:${action}`] = true
            })
          })
        })
        return newPermissions
      },
      "read_only": () => {
        const newPermissions: PermissionMap = {}
        Object.values(PERMISSION_CATEGORIES).forEach(category => {
          category.resources.forEach(subject => {
            newPermissions[`${subject}:read`] = true
          })
        })
        return newPermissions
      },
      "no_delete": () => {
        const newPermissions: PermissionMap = {}
        Object.values(PERMISSION_CATEGORIES).forEach(category => {
          category.resources.forEach(subject => {
            Object.keys(ACTIONS).forEach(action => {
              newPermissions[`${subject}:${action}`] = action !== 'delete'"
            })
          })
        })
        return newPermissions
      }
    }

    if (template in templates) {
      setPermissions(templates[template as keyof typeof templates]())
    }
  }, [])

  const filteredCategories = Object.entries(PERMISSION_CATEGORIES).map(([category, data]) => ({
    category,
    ...data,
    resources: data.resources.filter(resource => 
      resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.permissions[resource].toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.resources.length > 0)

  if (initialLoad) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select 
          value={compareRoleId || "none"} 
          onValueChange={setCompareRoleId}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Compare with role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {availableRoles
              .filter(role => role.id && role.id.trim() !== '')
              .map(role => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <History className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Permission History</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">{entry.user}</p>
                  <p className="text-muted-foreground">
                    {entry.action} {entry.subject} permission on {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => applyTemplate("full_access")}>
          Full Access
        </Button>
        <Button variant="outline" onClick={() => applyTemplate("read_only")}>
          Read Only
        </Button>
        <Button variant="outline" onClick={() => applyTemplate("no_delete")}>
          No Delete
        </Button>
      </div>

      <div className="rounded-md border">
        {filteredCategories.map(({ category, resources, description, permissions: resourceDescriptions }) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted">
              <h3 className="text-lg font-semibold">{category}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Resource</TableHead>
                  {Object.entries(ACTIONS).map(([action, description]) => (
                    <TableHead key={action} className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="capitalize">{action}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Checkbox
                          checked={resources.every(subject => 
                            permissions[`${subject}:${action}`]
                          )}
                          onCheckedChange={(checked) => 
                            handleColumnSelect(action, checked as boolean)
                          }
                        />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map(subject => (
                  <TableRow key={subject}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={Object.keys(ACTIONS).every(action => 
                            permissions[`${subject}:${action}`]
                          )}
                          onCheckedChange={(checked) => 
                            handleRowSelect(subject, checked as boolean)
                          }
                        />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="capitalize">{subject.replace(/_/g, ' '")}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{resourceDescriptions[subject]}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    {Object.keys(ACTIONS).map(action => (
                      <TableCell key={action} className="text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={permissions[`${subject}:${action}`] || false}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(subject, action, checked as boolean)
                            }
                          />
                          {compareRoleId && (
                            <div className={`ml-2 h-2 w-2 rounded-full ${
                              comparePermissions[`${subject}:${action}`] === permissions[`${subject}:${action}`]
                                ? 'bg-green-500'"
                                : 'bg-red-500'"
                            }`} />
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Permissions"}
        </Button>
      </div>
    </div>
  )
}
