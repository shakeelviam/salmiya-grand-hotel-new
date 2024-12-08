"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getRoomServiceItems } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils/currency"

const orderSchema = z.object({
  items: z.array(z.object({
    item: z.string(),
    quantity: z.number().min(1),
    notes: z.string().optional()
  }))
})

export default function RoomServiceMenu() {
  const params = useParams()
  const roomId = params.roomId as string
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<"Food" | "Non-Food" | null>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<any[]>([])

  useEffect(() => {
    async function loadMenuItems() {
      try {
        const response = await getRoomServiceItems()
        setMenuItems(response.data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load menu items",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    loadMenuItems()
  }, [])

  const filteredItems = menuItems.filter(item => 
    category ? item.category === category : true
  )

  const addToOrder = (item: any) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.item === item.name)
      if (existing) {
        return prev.map(i => 
          i.item === item.name 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { item: item.name, quantity: 1, notes: "" }]
    })
  }

  const removeFromOrder = (itemName: string) => {
    setSelectedItems(prev => prev.filter(i => i.item !== itemName))
  }

  const updateQuantity = (itemName: string, quantity: number) => {
    setSelectedItems(prev => 
      prev.map(i => 
        i.item === itemName 
          ? { ...i, quantity: Math.max(1, quantity) }
          : i
      )
    )
  }

  const submitOrder = async () => {
    try {
      setLoading(true)
      
      const orderData = {
        doctype: "Room Service Order",
        room: roomId,
        items: selectedItems,
        status: "Pending",
        category: category
      }

      await fetch('/api/room-service/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      toast({
        title: "Order Placed",
        description: "Your order has been sent to the kitchen"
      })

      setSelectedItems([])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!category) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold text-center">Room Service</h1>
        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            className="h-32"
            onClick={() => setCategory("Food")}
          >
            Food Menu
          </Button>
          <Button
            size="lg"
            className="h-32"
            onClick={() => setCategory("Non-Food")}
          >
            Other Services
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {category === "Food" ? "Food Menu" : "Other Services"}
        </h1>
        <Button variant="outline" onClick={() => setCategory(null)}>
          Back
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.name}>
              <CardContent className="p-4 flex items-center gap-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.item_name}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{item.item_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="font-medium">{formatCurrency(item.standard_rate, 'KWD', 3)}</p>
                </div>
                <Button onClick={() => addToOrder(item)}>
                  Add to Order
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedItems.length > 0 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedItems.map((item) => {
                  const menuItem = menuItems.find(m => m.name === item.item)
                  return (
                    <div key={item.item} className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{menuItem?.item_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(menuItem?.standard_rate || 0, 'KWD', 3)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.item, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.item, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromOrder(item.item)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )
                })}

                <div className="pt-4 border-t">
                  <p className="font-semibold text-lg">
                    Total: {formatCurrency(selectedItems.reduce((total, item) => {
                      const menuItem = menuItems.find(m => m.name === item.item)
                      return total + (menuItem?.standard_rate || 0) * item.quantity
                    }, 0), 'KWD', 3)}
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={submitOrder}
                  disabled={loading}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
