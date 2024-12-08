"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils/date"
import { ActionButtons } from "@/components/ui/action-buttons"
import { useQuery } from "@tanstack/react-query"

interface MaintenanceTask {
  id: string
  title: string
  description: string
  priority: string
  status: string
  assignedTo: {
    name: string
  }
  room?: {
    number: string
  }
  dueDate: string
  createdAt: string
}

export function MaintenanceTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  const { data: tasks, isLoading } = useQuery<MaintenanceTask[]>({
    queryKey: ["maintenance-tasks"],
    queryFn: async () => {
      const response = await fetch("/api/maintenance")
      if (!response.ok) {
        throw new Error("Failed to fetch maintenance tasks")
      }
      return response.json()
    },
  })

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.room?.number.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    const matchesStatus = statusFilter === "all" || task.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleView = (id: string) => {
    // Implement view logic
  }

  const handleEdit = (id: string) => {
    // Implement edit logic
  }

  const handleToggle = async (id: string) => {
    try {
      const response = await fetch(`/api/maintenance/${id}/toggle`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to toggle task status")
      }

      toast({
        title: "Success",
        description: "Task status updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    }
    return colors[priority.toLowerCase()] || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800"
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger className="max-w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks?.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.room?.number || "N/A"}</TableCell>
                <TableCell>{task.assignedTo.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(task.dueDate)}</TableCell>
                <TableCell className="text-right">
                  <ActionButtons
                    onView={() => handleView(task.id)}
                    onEdit={() => handleEdit(task.id)}
                    onToggle={() => handleToggle(task.id)}
                    toggleTitle={
                      task.status === "completed"
                        ? "Mark as Pending"
                        : "Mark as Completed"
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
