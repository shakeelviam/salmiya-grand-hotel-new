import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { formatKWD } from "@/lib/currency"

interface OrderDialogProps {
  item: any
  isOpen: boolean
  onClose: () => void
}

export function OrderDialog({ item, isOpen, onClose }: OrderDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [roomNumber, setRoomNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/room-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_code: item.name,
          quantity,
          room_number: roomNumber,
          notes,
        }),
      })

      if (!response.ok) throw new Error('Failed to place order')

      toast({
        title: 'Order Placed',
        description: `Your order for ${item.item_name} has been placed successfully.`,
      })

      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place Room Service Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Item</Label>
            <div className="flex justify-between items-center">
              <span>{item?.item_name}</span>
              <span className="font-medium">{formatKWD(item?.standard_rate)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">Room Number</Label>
            <Input
              id="room"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="Enter room number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions?"
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-lg font-medium">
              <span>Total</span>
              <span>{formatKWD(item?.standard_rate * quantity)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
