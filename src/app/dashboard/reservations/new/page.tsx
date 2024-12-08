'use client'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { createReservation } from "@/lib/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { cn } from "@/lib/utils/styles"
import { CalendarIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"

interface RoomType {
  id: string
  name: string
  basePrice: number
  adultCapacity: number
  childCapacity: number
  extraBedPrice: number
}

interface Guest {
  id: string
  name: string
  email: string
  phone: string
}

interface PaymentMode {
  id: string
  name: string
}

const formSchema = z.object({
  guestId: z.string().min(1, "Guest is required"),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  checkIn: z.date({
    required_error: "Check-in date is required",
  }),
  checkOut: z.date({
    required_error: "Check-out date is required",
  }),
  roomTypeId: z.string().min(1, "Room type is required"),
  adults: z.coerce.number().min(1, "At least 1 adult is required"),
  kids: z.coerce.number().min(0, "Number of kids cannot be negative"),
  specialRequests: z.string().optional(),
  extraBed: z.boolean().default(false),
  advanceAmount: z.coerce.number().min(0, "Advance amount cannot be negative"),
  paymentModeId: z.string().optional(),
})

export default function NewReservationPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [roomTypesResponse, guestsResponse, paymentModesResponse] = await Promise.all([
          fetch('/api/room-types', { credentials: 'include' }),
          fetch('/api/guests', { credentials: 'include' }),
          fetch('/api/payment-modes', { credentials: 'include' })
        ])

        if (!roomTypesResponse.ok || !guestsResponse.ok || !paymentModesResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const roomTypesData = await roomTypesResponse.json()
        const guestsData = await guestsResponse.json()
        const paymentModesData = await paymentModesResponse.json()

        setRoomTypes(roomTypesData)
        setGuests(guestsData)
        setPaymentModes(paymentModesData.data)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      phone: "",
      adults: 1,
      kids: 0,
      extraBed: false,
      specialRequests: "",
      advanceAmount: 0,
    },
  })

  const selectedRoomType = form.watch("roomTypeId") ? 
    roomTypes.find(type => type.id === form.watch("roomTypeId")) : null

  const checkIn = form.watch("checkIn")
  const checkOut = form.watch("checkOut")
  const adults = form.watch("adults")
  const kids = form.watch("kids")
  const extraBed = form.watch("extraBed")

  // Calculate total amount
  const days = checkIn && checkOut ? 
    Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0
  const roomCharges = selectedRoomType ? selectedRoomType.basePrice * days : 0
  const extraBedCharges = extraBed ? (selectedRoomType?.extraBedPrice || 0) * days : 0
  const totalAmount = roomCharges + extraBedCharges

  // Watch for guest selection to auto-fill email and phone
  const selectedGuestId = form.watch("guestId")
  useEffect(() => {
    if (selectedGuestId) {
      const selectedGuest = guests.find(g => g.id === selectedGuestId)
      if (selectedGuest) {
        form.setValue("email", selectedGuest.email)
        form.setValue("phone", selectedGuest.phone)
      }
    }
  }, [selectedGuestId, guests, form])

  // Watch for room type and occupancy changes
  useEffect(() => {
    if (selectedRoomType && (adults > selectedRoomType.adultCapacity || kids > selectedRoomType.childCapacity)) {
      form.setValue("extraBed", true)
    }
  }, [selectedRoomType, adults, kids, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      const formattedValues = {
        ...values,
        children: values.kids,
        extraBeds: values.extraBed ? 1 : 0,
        advanceAmount: values.advanceAmount || 0,
        paymentModeId: values.advanceAmount > 0 ? values.paymentModeId : undefined
      }
      await createReservation(formattedValues)
      router.push("/dashboard/reservations")
      toast({
        title: "Success",
        description: "Reservation created successfully",
      })
    } catch (error) {
      console.error("Error creating reservation:", error)
      toast({
        title: "Error",
        description: "Failed to create reservation",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">New Reservation</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
            <CardDescription>
              Create a new reservation by filling out the form below
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a guest" />
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

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
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
                                date < checkIn || date < new Date("1900-01-01")
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

                <FormField
                  control={form.control}
                  name="roomTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roomTypes.map((type) => (
                            <SelectItem
                              key={type.id}
                              value={type.id}
                            >
                              {type.name} (KWD {type.basePrice.toFixed(3)}/night)
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
                    name="adults"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adults</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="kids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kids</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {selectedRoomType && (adults > selectedRoomType.adultCapacity || kids > selectedRoomType.childCapacity) && (
                  <FormField
                    control={form.control}
                    name="extraBed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Extra Bed</FormLabel>
                          <FormDescription>
                            Add an extra bed for KWD {selectedRoomType.extraBedPrice.toFixed(3)}/night
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="advanceAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Advance Amount (KWD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.001}
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional advance payment to confirm the reservation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("advanceAmount") > 0 && (
                    <FormField
                      control={form.control}
                      name="paymentModeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Mode</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paymentModes.map((mode) => (
                                <SelectItem key={mode.id} value={mode.id}>
                                  {mode.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Room Charges:</span>
                    <span>KWD {roomCharges.toFixed(3)}</span>
                  </div>
                  {extraBed && (
                    <div className="flex justify-between font-bold">
                      <span>Extra Bed Charges:</span>
                      <span>KWD {extraBedCharges.toFixed(3)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>KWD {totalAmount.toFixed(3)}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Reservation"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selected Room Type Details</CardTitle>
            <CardDescription>
              View the details of the selected room type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRoomType ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Room Type</h3>
                  <p>{selectedRoomType.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Base Price</h3>
                  <p>KWD {selectedRoomType.basePrice.toFixed(3)}/night</p>
                </div>
                <div>
                  <h3 className="font-semibold">Capacity</h3>
                  <p>{selectedRoomType.adultCapacity} Adults, {selectedRoomType.childCapacity} Kids</p>
                </div>
                {selectedRoomType.extraBedPrice > 0 && (
                  <div>
                    <h3 className="font-semibold">Extra Bed Price</h3>
                    <p>KWD {selectedRoomType.extraBedPrice.toFixed(3)}/night</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Select a room type to view its details</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
