"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getKitchenOrders, updateRoomServiceOrderStatus } from "@/lib/erpnext"
import { useToast } from "@/components/ui/use-toast"

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([])
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
      setOrders(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(orderId: string, status: string) {
    try {
      await updateRoomServiceOrderStatus(orderId, status)
      await loadOrders() // Refresh orders
      toast({
        title: "Status Updated",
        description: `Order status changed to ${status}`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <Card key={order.name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Order #{order.name}</CardTitle>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Room {order.room} • {new Date(order.creation).toLocaleTimeString()}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {order.items.map((item: any) => (
                    <div key={item.name} className="flex justify-between">
                      <span>{item.quantity}× {item.item_name}</span>
                      <span className="text-muted-foreground">{item.notes}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {order.status === "Pending" && (
                    <Button
                      className="flex-1"
                      onClick={() => updateStatus(order.name, "In Progress")}
                    >
                      Start Preparing
                    </Button>
                  )}
                  {order.status === "In Progress" && (
                    <Button
                      className="flex-1"
                      onClick={() => updateStatus(order.name, "Completed")}
                    >
                      Mark as Ready
                    </Button>
                  )}
                  {order.status !== "Cancelled" && order.status !== "Completed" && (
                    <Button
                      variant="destructive"
                      onClick={() => updateStatus(order.name, "Cancelled")}
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
    </div>
  )
}
