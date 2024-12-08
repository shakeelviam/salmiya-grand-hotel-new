"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getKitchenOrders, updateRoomServiceStatus } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface KitchenOrder {
  id: string
  room: {
    number: string
  }
  service: {
    name: string
    category: {
      name: string
    }
  }
  quantity: number
  notes?: string
  status: string
  createdAt: string
  reservation: {
    user: {
      name: string
    }
  }
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadOrders()
    // Poll for new orders every 30 seconds
    const interval = setInterval(loadOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadOrders() {
    try {
      const response = await getKitchenOrders()
      setOrders(response)
      setLoading(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  async function handleStatusUpdate(orderId: string, newStatus: string) {
    try {
      await updateRoomServiceStatus(orderId, newStatus)
      toast({
        title: "Success",
        description: "Order status updated successfully",
      })
      loadOrders() // Reload orders to reflect the change
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      READY: "bg-emerald-100 text-emerald-800"
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Kitchen Orders</h2>
        <Button onClick={loadOrders} disabled={loading}>
          Refresh Orders
        </Button>
      </div>

      {loading ? (
        <div>Loading orders...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Order #{order.id.slice(-6)}</CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Room {order.room.number} • {new Date(order.createdAt).toLocaleTimeString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Guest: {order.reservation.user.name}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{order.quantity}× {order.service.name}</span>
                      {order.notes && (
                        <span className="text-muted-foreground">{order.notes}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === "PENDING" && (
                      <Button
                        className="flex-1"
                        onClick={() => handleStatusUpdate(order.id, "IN_PROGRESS")}
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === "IN_PROGRESS" && (
                      <Button
                        className="flex-1"
                        onClick={() => handleStatusUpdate(order.id, "READY")}
                      >
                        Mark as Ready
                      </Button>
                    )}
                    {order.status === "READY" && (
                      <Button
                        className="flex-1"
                        onClick={() => handleStatusUpdate(order.id, "COMPLETED")}
                      >
                        Mark as Delivered
                      </Button>
                    )}
                    {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusUpdate(order.id, "CANCELLED")}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {orders.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No active orders at the moment
            </div>
          )}
        </div>
      )}
    </div>
  )
}
