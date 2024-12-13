"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Save } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  checkInTime: z.string(),
  checkOutTime: z.string(),
  lateCheckOutFee: z.number().min(0),
  earlyCheckOutFee: z.number().min(0),
  noShowFee: z.number().min(0),
  freeCancellationHours: z.number().min(0),
  cancellationFee: z.number().min(0),
  refundPercentage: z.number().min(0).max(100),
  lateRefundPercentage: z.number().min(0).max(100),
  unconfirmedHoldHours: z.number().min(0),
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
      lateCheckOutFee: 0,
      earlyCheckOutFee: 0,
      noShowFee: 0,
      freeCancellationHours: 24,
      cancellationFee: 0,
      refundPercentage: 100,
      lateRefundPercentage: 0,
      unconfirmedHoldHours: 24,
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
        
        // Convert string numbers to actual numbers for the form
        const formData = {
          ...data,
          lateCheckOutFee: Number(data.lateCheckOutFee),
          earlyCheckOutFee: Number(data.earlyCheckOutFee),
          noShowFee: Number(data.noShowFee),
          cancellationFee: Number(data.cancellationFee),
        }
        
        form.reset(formData)
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
      const response = await fetch('/api/settings/hotel-policy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update hotel policy")
      }

      toast({
        title: "Success",
        description: "Hotel policy updated successfully",
      })
      
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update hotel policy",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-[200px]" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-red-500 text-lg">{error}</div>
        <Button variant="outline" onClick={() => router.refresh()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Hotel Policies</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policy Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
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

                <FormField
                  control={form.control}
                  name="lateCheckOutFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Late Check-out Fee (KWD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="earlyCheckOutFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Early Check-out Fee (KWD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="noShowFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No-show Fee (KWD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="freeCancellationHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Free Cancellation Period (Hours)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cancellationFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Late Cancellation Fee (KWD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="refundPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refund Percentage (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          min="0"
                          max="100"
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lateRefundPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Late Cancellation Refund (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          min="0"
                          max="100"
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unconfirmedHoldHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unconfirmed Reservation Hold (Hours)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
