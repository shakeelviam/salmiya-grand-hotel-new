"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Save } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"

const formSchema = z.object({
  // Check-in/out times
  checkInTime: z.string(),
  checkOutTime: z.string(),
  lateCheckoutCharge: z.coerce.number().min(0),
  earlyCheckoutCharge: z.coerce.number().min(0),
  maxLateCheckoutHours: z.coerce.number().min(0).max(24),
  
  // Cancellation policies
  freeCancellationHours: z.coerce.number().min(0),
  cancellationCharge: z.coerce.number().min(0).max(100),
  
  // No show policies
  noShowCharge: z.coerce.number().min(0).max(100),
  noShowDeadlineHours: z.coerce.number().min(0).max(48),
  
  // Payment policies
  advancePaymentPercent: z.coerce.number().min(0).max(100),
  fullPaymentDeadline: z.coerce.number().min(0),
  
  // Reservation policies
  unconfirmedHoldHours: z.coerce.number().min(1).max(72),
  minAdvanceBookingHours: z.coerce.number().min(0),
  maxAdvanceBookingDays: z.coerce.number().min(1).max(365),
  
  // Group booking policies
  minGroupSize: z.coerce.number().min(2),
  groupDiscountPercent: z.coerce.number().min(0).max(100),
})

type FormData = z.infer<typeof formSchema>

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkInTime: "14:00",
      checkOutTime: "12:00",
      lateCheckoutCharge: 50,
      earlyCheckoutCharge: 100,
      maxLateCheckoutHours: 6,
      freeCancellationHours: 48,
      cancellationCharge: 50,
      noShowCharge: 100,
      noShowDeadlineHours: 24,
      advancePaymentPercent: 20,
      fullPaymentDeadline: 24,
      unconfirmedHoldHours: 24,
      minAdvanceBookingHours: 24,
      maxAdvanceBookingDays: 365,
      minGroupSize: 5,
      groupDiscountPercent: 10,
    }
  })

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/settings/hotel-policy')
        if (!response.ok) {
          throw new Error('Failed to load hotel policy')
        }
        const data = await response.json()
        form.reset(data)
      } catch (error) {
        setError('Failed to load hotel policy')
        toast({
          title: "Error",
          description: "Failed to load hotel policy",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPolicy()
  }, [form, toast])

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/hotel-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update hotel policy')
      }

      toast({
        title: "Success",
        description: "Hotel policy updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update hotel policy",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Hotel Settings</CardTitle>
            <CardDescription>Loading settings...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Hotel Policies</CardTitle>
          <CardDescription>Configure your hotel's operational policies and rules</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Check-in/out Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Check-in/out Times</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="checkInTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="checkOutTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-out Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="lateCheckoutCharge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Late Checkout Charge (per hour)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="earlyCheckoutCharge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Early Checkout Charge (flat)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxLateCheckoutHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Late Checkout Hours</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Cancellation Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Cancellation Policies</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="freeCancellationHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Free Cancellation Hours</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Hours before check-in for free cancellation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cancellationCharge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cancellation Charge (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormDescription>
                          Percentage of total amount to charge for late cancellation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* No Show Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">No Show Policies</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="noShowCharge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No Show Charge (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="noShowDeadlineHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No Show Deadline Hours</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Hours after check-in time to mark as no-show
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Policies</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="advancePaymentPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required Advance Payment (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fullPaymentDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Payment Deadline</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Hours before check-in for full payment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Reservation Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Reservation Policies</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="unconfirmedHoldHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unconfirmed Hold Hours</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Hours to hold unconfirmed reservation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minAdvanceBookingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Advance Booking Hours</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxAdvanceBookingDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Advance Booking Days</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Group Booking Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Group Booking Policies</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minGroupSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Group Size</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Minimum number of rooms for group booking
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="groupDiscountPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Discount (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormDescription>
                          Default discount percentage for group bookings
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
