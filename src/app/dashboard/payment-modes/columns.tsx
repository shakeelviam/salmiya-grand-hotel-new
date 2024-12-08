import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { PaymentModeActions } from "./actions"

export type PaymentMode = {
  id: string
  name: string
  code: string
  description: string | null
  isActive: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<PaymentMode>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left">Name</div>,
  },
  {
    accessorKey: "code",
    header: () => <div className="text-left">Code</div>,
  },
  {
    accessorKey: "description",
    header: () => <div className="text-left">Description</div>,
    cell: ({ row }) => row.getValue("description") || "-",
  },
  {
    accessorKey: "isActive",
    header: () => <div className="text-left">Status</div>,
    cell: ({ row }) => {
      const isActive = row.getValue("isActive")
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "isDefault",
    header: () => <div className="text-left">Default</div>,
    cell: ({ row }) => {
      const isDefault = row.getValue("isDefault")
      return isDefault ? (
        <Badge className="bg-blue-500 hover:bg-blue-600">Default</Badge>
      ) : (
        "-"
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <PaymentModeActions data={row.original} />,
  },
]
