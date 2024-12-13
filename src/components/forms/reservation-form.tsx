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
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"

const reservationSchema = z.object({
  guestId: z.string().min(1, "Guest is required"),
  roomTypeId: z.string().min(1, "Room type is required"),
  roomId: z.string().min(1, "Room is required"),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  adults: z.coerce.number().min(1, "At least 1 adult is required"),
  children: z.coerce.number().min(0, "Children cannot be negative"),
  extraBeds: z.coerce.number().min(0, "Extra beds cannot be negative"),
  advanceAmount: z.coerce.number().min(0, "Advance amount cannot be negative"),
  paymentMode: z.string().optional(),
  notes: z.string().optional(),
})

type Guest = {
  id: string
  name: string
  email: string
  phone: string
}

type RoomType = {
  id: string
  name: string
  basePrice: number
  extraBedCharge: number
}

type Room = {
  id: string
  number: string
  roomTypeId: string
}

type Props = {
  onSuccess?: () => void
}

export function ReservationForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof reservationSchema>>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      adults: 1,
      children: 0,
      extraBeds: 0,
      advanceAmount: 0,
      paymentMode: "",
      notes: "",
    },
  })

  // Fetch guests
  useEffect(() => {
    async function fetchGuests() {
      try {
        const response = await fetch('/api/guests')
        if (!response.ok) throw new Error('Failed to fetch guests')
        const data = await response.json()
        setGuests(data.data || [])
      } catch (error) {
        console.error('Error fetching guests:', error)
        toast({
          title: "Error",
          description: "Failed to fetch guests",
          variant: "destructive"
        })
      }
    }
    fetchGuests()
  }, [])

  // Fetch room types
  useEffect(() => {
    async function fetchRoomTypes() {
      try {
        const response = await fetch('/api/room-types')
        if (!response.ok) throw new Error('Failed to fetch room types')
        const data = await response.json()
        setRoomTypes(data.data || [])
      } catch (error) {
        console.error('Error fetching room types:', error)
        toast({
          title: "Error",
          description: "Failed to fetch room types",
          variant: "destructive"
        })
      }
    }
    fetchRoomTypes()
  }, [])

  // Fetch available rooms when room type is selected
  useEffect(() => {
    async function fetchRooms() {
      if (!form.watch('roomTypeId')) return
      try {
        const response = await fetch(`/api/rooms?typeId=${form.watch('roomTypeId')}&available=true`)
        if (!response.ok) throw new Error('Failed to fetch rooms')
        const data = await response.json()
        setRooms(data.data || [])
      } catch (error) {
        console.error('Error fetching rooms:', error)
        toast({
          title: "Error",
          description: "Failed to fetch rooms",
          variant: "destructive"
        })
      }
    }
    fetchRooms()
  }, [form.watch('roomTypeId')])

  // Update guest details when guest is selected
  const handleGuestChange = (guestId: string) => {
    const guest = guests.find(g => g.id === guestId)
    if (guest) {
      setSelectedGuest(guest)
    }
  }

  // Update room type details and reset room selection when room type changes
  const handleRoomTypeChange = (roomTypeId: string) => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId)
    if (roomType) {
      setSelectedRoomType(roomType)
      form.setValue('roomId', '') // Reset room selection
    }
  }

  // Calculate total amount
  const calculateTotal = () => {
    if (!selectedRoomType) return 0
    const checkIn = new Date(form.watch('checkIn'))
    const checkOut = new Date(form.watch('checkOut'))
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const extraBedTotal = (form.watch('extraBeds') || 0) * selectedRoomType.extraBedCharge
    return (selectedRoomType.basePrice * nights) + extraBedTotal
  }

  async function onSubmit(values: z.infer<typeof reservationSchema>) {
    try {
      setLoading(true)
      const totalAmount = calculateTotal()

      // Validate payment mode if advance amount is provided
      if (values.advanceAmount > 0 && !values.paymentMode) {
        toast({
          title: "Error",
          description: "Please select a payment mode for the advance payment",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          totalAmount,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create reservation')
      }

      toast({
        title: "Success",
        description: "Reservation created successfully",
      })

      form.reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create reservation",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Guest Selection */}
          <FormField
            control={form.control}
            name="guestId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guest</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    handleGuestChange(value)
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select guest" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {guests.map((guest) => (
                      <SelectItem key={guest.id} value={guest.id}>
                        {guest.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Guest Details */}
          {selectedGuest && (
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Email:</span>
                <span className="ml-2 text-sm text-gray-600">{selectedGuest.email}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Phone:</span>
                <span className="ml-2 text-sm text-gray-600">{selectedGuest.phone}</span>
              </div>
            </div>
          )}

          {/* Room Type Selection */}
          <FormField
            control={form.control}
            name="roomTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    handleRoomTypeChange(value)
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} - {formatCurrency(type.basePrice)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Room Selection */}
          <FormField
            control={form.control}
            name="roomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Check-in Date */}
          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-in Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Check-out Date */}
          <FormField
            control={form.control}
            name="checkOut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-out Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Adults */}
          <FormField
            control={form.control}
            name="adults"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adults</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Children */}
          <FormField
            control={form.control}
            name="children"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Children</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Extra Beds */}
          <FormField
            control={form.control}
            name="extraBeds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Extra Beds</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                {selectedRoomType && (
                  <div className="text-sm text-gray-600">
                    Extra bed charge: {formatCurrency(selectedRoomType.extraBedCharge)}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Advance Amount */}
          <FormField
            control={form.control}
            name="advanceAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Advance Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.001" 
                    placeholder="0.000"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Mode */}
          <FormField
            control={form.control}
            name="paymentMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Mode</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={form.watch('advanceAmount') <= 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="MOBILE_PAYMENT">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Total Amount Display */}
        <div className="text-lg font-semibold">
          Total Amount: {formatCurrency(calculateTotal())}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Reservation"}
        </Button>
      </form>
    </Form>
  )
}
