import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoomServiceMenu } from "./room-service-menu"
import { OrderTracker } from "./order-tracker"

interface Order {
  id: string
  status: "pending" | "preparing" | "delivering" | "delivered"
  timestamp: string
  items: {
    name: string
    quantity: number
    price: number
  }[]
}

interface GuestDashboardProps {
  roomNumber: string
  menuItems: {
    id: string
    name: string
    description: string
    price: number
    category: string
    imageUrl: string
  }[]
  activeOrders: Order[]
  onOrder: (items: { itemId: string; quantity: number; specialInstructions: string }[]) => Promise<void>
}

export function GuestDashboard({
  roomNumber,
  menuItems,
  activeOrders,
  onOrder,
}: GuestDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("menu")

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Welcome to Room {roomNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Order delicious meals and refreshments directly to your room.
          </p>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="orders" data-count={activeOrders.length}>
            Active Orders {activeOrders.length > 0 && `(${activeOrders.length})`}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="menu">
          <RoomServiceMenu items={menuItems} onOrder={onOrder} />
        </TabsContent>
        <TabsContent value="orders">
          <div className="space-y-4">
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  No active orders
                </CardContent>
              </Card>
            ) : (
              activeOrders.map((order) => (
                <OrderTracker
                  key={order.id}
                  orderId={order.id}
                  initialStatus={{
                    status: order.status,
                    timestamp: order.timestamp,
                  }}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
