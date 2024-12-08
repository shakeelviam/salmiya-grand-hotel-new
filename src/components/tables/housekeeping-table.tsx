"use client"

import { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

type HousekeepingTask = {
  id: string
  roomNumber: string
  status: string
  priority: string
  type: string
  assignedTo: {
    name: string
  }
  dueDate: string
  createdAt: string
  completedAt: string | null
}

const columns: ColumnDef<HousekeepingTask>[] = [
  {
    accessorKey: "roomNumber",
    header: "Room",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant="outline">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string
      return (
        <Badge
          variant={
            priority === "high"
              ? "destructive"
              : priority === "medium"
              ? "default"
              : "secondary"
          }
        >
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "assignedTo.name",
    header: "Assigned To",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={status === "completed" ? "default" : "secondary"}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("dueDate"))
      return format(date, "PPP")
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original
      const queryClient = useQueryClient()
      const { toast } = useToast()

      const toggleStatus = async () => {
        try {
          const response = await fetch(
            `/api/housekeeping/${task.id}/toggle`,
            {
              method: "PATCH",
            }
          )

          if (!response.ok) {
            throw new Error("Failed to update task status")
          }

          await queryClient.invalidateQueries(["housekeeping-tasks"])
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

      return (
        <Button
          variant="outline"
          size="sm"
          onClick={toggleStatus}
        >
          {task.status === "completed" ? "Mark Pending" : "Mark Complete"}
        </Button>
      )
    },
  },
]

export function HousekeepingTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )

  const { data: tasks = [] } = useQuery({
    queryKey: ["housekeeping-tasks"],
    queryFn: async () => {
      const response = await fetch("/api/housekeeping")
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      return response.json()
    },
  })

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Filter by room..."
          value={
            (table
              .getColumn("roomNumber")
              ?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table
              .getColumn("roomNumber")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={
            (table.getColumn("status")?.getFilterValue() as string) ??
            ""
          }
          onValueChange={(value) =>
            table.getColumn("status")?.setFilterValue(value)
          }
        >
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
