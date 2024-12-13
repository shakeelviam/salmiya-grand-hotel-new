"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { formatDate } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { Payment } from "@/app/dashboard/payments/page"

function AmountCell({ amount }: { amount: number }) {
  return (
    <div className="text-right font-medium">
      {formatCurrency(amount)}
    </div>
  )
}

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "receiptNumber",
    header: () => <div className="text-left">Receipt No.</div>,
    cell: ({ row }) => row.getValue("receiptNumber") || "-",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      return <AmountCell amount={amount} />
    },
  },
  {
    accessorKey: "paymentMode",
    header: () => <div className="text-left">Payment Mode</div>,
    cell: ({ row }) => {
      const mode = row.getValue("paymentMode") as string
      return mode.split("_").map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(" ")
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-left">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "warning" | "success" }> = {
        PENDING: { label: "Pending", variant: "warning" },
        COMPLETED: { label: "Completed", variant: "success" },
        FAILED: { label: "Failed", variant: "destructive" },
        REFUNDED: { label: "Refunded", variant: "default" },
        PARTIALLY_REFUNDED: { label: "Partially Refunded", variant: "warning" },
        CANCELLED: { label: "Cancelled", variant: "destructive" },
      }

      const { label, variant } = statusMap[status] || { label: status, variant: "default" }
      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    accessorKey: "transactionId",
    header: () => <div className="text-left">Transaction ID</div>,
    cell: ({ row }) => row.getValue("transactionId") || "-",
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-left">Date</div>,
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
]

interface PaymentsTableProps {
  data: Payment[]
  isLoading?: boolean
}

export function PaymentsTable({ data, isLoading }: PaymentsTableProps) {
  return (
    <DataTable 
      columns={columns} 
      data={data} 
      isLoading={isLoading} 
      searchField="receiptNumber"
    />
  )
}
