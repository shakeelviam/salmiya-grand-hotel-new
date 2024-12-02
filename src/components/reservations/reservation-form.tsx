'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

interface Guest {
  name: string
  customer_name: string
  mobile_no: string
  email: string
}

interface Room {
  name: string
  room_number: string
  room_type: string
  status: string
}

const formSchema = z.object({
  guestId: z.string({
    required_error: "Please select a guest",
  }),
  roomId: z.string({
    required_error: "Please select a room",
  }),
  checkIn: z.date({
    required_error: "Please select a check-in date",
  }),
  checkOut: z.date({
    required_error: "Please select a check-out date",
  }),
  adults: z.string().min(1, "At least 1 adult is required"),
  children: z.string().default("0"),
  specialRequests: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function ReservationForm() {
  const [loading, setLoading] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const { toast } = useToast()
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adults: "1",
      children: "0",
      specialRequests: "",
    },
  })

  // Fetch guests (customers) from ERPNext
  useEffect(() => {
    async function fetchGuests() {
      try {
        const response = await fetch('/api/erpnext/customers')
        if (!response.ok) throw new Error('Failed to fetch guests')
        const data = await response.json()
        setGuests(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load guests',
          variant: 'destructive',
        })
      }
    }
    fetchGuests()
  }, [toast])

  // Fetch available rooms
  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await fetch('/api/erpnext/rooms?status=AVAILABLE')
        if (!response.ok) throw new Error('Failed to fetch rooms')
        const data = await response.json()
        setRooms(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load rooms',
          variant: 'destructive',
        })
      }
    }
    fetchRooms()
  }, [toast])

  async function onSubmit(data: FormValues) {
    try {
      setLoading(true)
      const response = await fetch('/api/erpnext/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          checkIn: format(data.checkIn, 'yyyy-MM-dd'),
          checkOut: format(data.checkOut, 'yyyy-MM-dd'),
        }),
      })

      if (!response.ok) throw new Error('Failed to create reservation')

      toast({
        title: 'Success',
        description: 'Reservation created successfully',
      })

      // Reset form
      form.reset()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create reservation',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="guestId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guest</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a guest" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {guests.map(guest => (
                    <SelectItem key={guest.name} value={guest.name}>
                      {guest.customer_name} - {guest.mobile_no}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select an existing guest or create a new one
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rooms.map(room => (
                    <SelectItem key={room.name} value={room.name}>
                      Room {room.room_number} - {room.room_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-in Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={loading}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkOut"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-out Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={loading}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date <= form.getValues("checkIn") ||
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="adults"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adults</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    {...field} 
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="children"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Children</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    {...field} 
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="specialRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requests</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Any special requirements?"
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Creating Reservation...' : 'Create Reservation'}
        </Button>
      </form>
    </Form>
  )
}
