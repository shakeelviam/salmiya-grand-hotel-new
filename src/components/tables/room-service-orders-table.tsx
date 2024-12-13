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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ActionButtons } from "@/components/ui/action-buttons"
import { formatDate } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { updateRoomServiceStatus } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface RoomServiceOrder {
  id: string
  reservationId: string
  guestName: string
  roomNumber: string
  items: Array<{
    itemName: string
    quantity: number
    rate: number
    notes?: string
  }>
  status: string
  totalAmount: number
  createdAt: string
  updatedAt: string
}

interface RoomServiceOrdersTableProps {
  orders: RoomServiceOrder[]
  onUpdate: () => void
}

export function RoomServiceOrdersTable({ orders, onUpdate }: RoomServiceOrdersTableProps) {
  const [loadingOrder, setLoadingOrder] = useState<string | null>(null)
  const { toast } = useToast()

  const handleToggleStatus = async (orderId: string, currentStatus: string) => {
    try {
      setLoadingOrder(orderId)
      const newStatus = currentStatus === "PENDING" ? "CANCELLED" : "PENDING"
      
      const response = await updateRoomServiceStatus(orderId, newStatus)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update order status")
      }

      toast({
        title: "Success",
        description: `Order ${currentStatus === "PENDING" ? "cancelled" : "restored"} successfully`,
      })

      onUpdate()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setLoadingOrder(null)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PREPARING: "bg-blue-100 text-blue-800",
      READY: "bg-green-100 text-green-800",
      DELIVERED: "bg-purple-100 text-purple-800",
      CANCELLED: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Guest</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
              No orders found
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id.slice(-6)}</TableCell>
              <TableCell>{order.guestName}</TableCell>
              <TableCell>Room {order.roomNumber}</TableCell>
              <TableCell>
                <ul className="list-disc list-inside">
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.quantity}x {item.itemName}
                    </li>
                  ))}
                </ul>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell className="text-right">
                {loadingOrder === order.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  <ActionButtons
                    onView={() => {
                      // TODO: Implement view functionality
                      console.log("View order", order.id)
                    }}
                    onEdit={order.status === "PENDING" ? () => {
                      // TODO: Implement edit functionality
                      console.log("Edit order", order.id)
                    } : undefined}
                    onToggle={order.status !== "DELIVERED" ? () => 
                      handleToggleStatus(order.id, order.status)
                    : undefined}
                    isActive={order.status !== "CANCELLED"}
                    hideToggle={order.status === "DELIVERED"}
                    hideEdit={order.status !== "PENDING"}
                  />
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
