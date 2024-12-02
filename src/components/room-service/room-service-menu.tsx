import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
}

interface RoomServiceMenuProps {
  items: MenuItem[]
  onOrder: (items: { itemId: string; quantity: number; specialInstructions: string }[]) => Promise<void>
}

export function RoomServiceMenu({ items, onOrder }: RoomServiceMenuProps) {
  const [selectedItems, setSelectedItems] = useState<
    Map<string, { quantity: number; specialInstructions: string }>
  >(new Map())
  const [isLoading, setIsLoading] = useState(false)

  const categories = Array.from(new Set(items.map((item) => item.category)))

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const newSelectedItems = new Map(selectedItems)
    if (quantity > 0) {
      newSelectedItems.set(itemId, {
        quantity,
        specialInstructions: selectedItems.get(itemId)?.specialInstructions || "",
      })
    } else {
      newSelectedItems.delete(itemId)
    }
    setSelectedItems(newSelectedItems)
  }

  const handleInstructionsChange = (itemId: string, instructions: string) => {
    const newSelectedItems = new Map(selectedItems)
    const item = newSelectedItems.get(itemId)
    if (item) {
      newSelectedItems.set(itemId, { ...item, specialInstructions: instructions })
      setSelectedItems(newSelectedItems)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const orderItems = Array.from(selectedItems.entries()).map(([itemId, details]) => ({
        itemId,
        quantity: details.quantity,
        specialInstructions: details.specialInstructions,
      }))
      await onOrder(orderItems)
      setSelectedItems(new Map())
    } catch (error) {
      console.error("Failed to submit order:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalAmount = Array.from(selectedItems.entries()).reduce((total, [itemId, details]) => {
    const item = items.find((i) => i.id === itemId)
    return total + (item?.price || 0) * details.quantity
  }, 0)

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h2 className="text-2xl font-bold">{category}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items
              .filter((item) => item.category === category)
              .map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-48 w-full rounded-md object-cover"
                    />
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-lg font-bold">${item.price.toFixed(2)}</p>
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                      <Input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="0"
                        value={selectedItems.get(item.id)?.quantity || 0}
                        onChange={(e) =>
                          handleQuantityChange(item.id, parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                    {selectedItems.has(item.id) && (
                      <div className="space-y-2">
                        <Label htmlFor={`instructions-${item.id}`}>Special Instructions</Label>
                        <Textarea
                          id={`instructions-${item.id}`}
                          value={selectedItems.get(item.id)?.specialInstructions || ""}
                          onChange={(e) => handleInstructionsChange(item.id, e.target.value)}
                          placeholder="Any special requests?"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
      {selectedItems.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(selectedItems.entries()).map(([itemId, details]) => {
                const item = items.find((i) => i.id === itemId)
                if (!item) return null
                return (
                  <div key={itemId} className="flex justify-between">
                    <span>
                      {item.name} x {details.quantity}
                    </span>
                    <span>${(item.price * details.quantity).toFixed(2)}</span>
                  </div>
                )
              })}
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Placing Order..." : "Place Order"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
