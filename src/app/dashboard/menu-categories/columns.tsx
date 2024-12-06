import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableRowActions } from "@/components/ui/data-table-row-actions"

export type MenuCategory = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export const columns: ColumnDef<MenuCategory>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return (
        <Badge variant={isActive ? "success" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
