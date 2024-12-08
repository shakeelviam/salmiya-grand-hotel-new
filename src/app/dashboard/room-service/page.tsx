"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { getActiveReservations, getRoomServiceItems, getRoomServiceOrders } from "@/lib/api"
import { RoomServiceOrdersTable } from "@/components/tables/room-service-orders-table"

const roomServiceSchema = z.object({
  reservation: z.string().min(1, "Reservation is required"),
  room: z.string().min(1, "Room is required"),
  items: z.array(z.object({
    item: z.string().min(1, "Item is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    rate: z.number().min(0, "Rate must be positive"),
    notes: z.string().optional()
  })).min(1, "At least one item is required")
})

export default function RoomServicePage() {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [reservations, setReservations] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])

  const loadData = async () => {
    try {
      const [reservationsData, itemsData, ordersData] = await Promise.all([
        getActiveReservations(),
        getRoomServiceItems(),
        getRoomServiceOrders()
      ])
      setReservations(reservationsData?.data || [])
      setMenuItems(itemsData?.data || [])
      setOrders(ordersData?.data || [])
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const form = useForm<z.infer<typeof roomServiceSchema>>({
    resolver: zodResolver(roomServiceSchema),
    defaultValues: {
      items: []
    }
  })

  async function onSubmit(values: z.infer<typeof roomServiceSchema>) {
    try {
      setLoading(true)
      
      const response = await fetch("/api/room-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to create room service order")
      }

      const data = await response.json()

      toast({
        title: "Room Service Order Created",
        description: `Order #${data.name} has been created successfully.`
      })

      form.reset()
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room service order",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Room Service Orders</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Service Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <RoomServiceOrdersTable 
            orders={orders} 
            onUpdate={loadData}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Room Service Order</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="reservation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reservation</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select reservation" />
                        </SelectTrigger>
                        <SelectContent>
                          {(reservations || []).map((reservation: any) => (
                            <SelectItem 
                              key={reservation.id} 
                              value={reservation.id}
                            >
                              Room {reservation.roomNumber || 'Unassigned'} - {reservation.guestName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dynamic Items Form Array */}
              <div className="space-y-4">
                {form.watch("items")?.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.item`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Item</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select item" />
                              </SelectTrigger>
                              <SelectContent>
                                {menuItems.map((item: any) => (
                                  <SelectItem 
                                    key={item.name} 
                                    value={item.name}
                                    onClick={() => {
                                      const items = form.getValues("items")
                                      items[index].rate = item.rate
                                      form.setValue("items", items)
                                    }}
                                  >
                                    {item.item_name} - ${item.rate}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        const items = form.getValues("items")
                        items.splice(index, 1)
                        form.setValue("items", items)
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const items = form.getValues("items") || []
                    form.setValue("items", [
                      ...items,
                      { item: "", quantity: 1, rate: 0, notes: "" }
                    ])
                  }}
                >
                  Add Item
                </Button>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Order"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
