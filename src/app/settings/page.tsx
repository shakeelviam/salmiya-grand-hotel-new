"use client"

import { useState, useEffect } from "react""
import { useForm } from 'react-hook-form'"
import { zodResolver } from "@hookform/resolvers/zod'""
import * as z from 'zod'"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card'"""
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form'"""
import { Input } from "@/components/ui/input'"""
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select'"""
import { Button } from "@/components/ui/button'"""
import { useToast } from "@/hooks/use-toast'"""
import { Loader2 } from 'lucide-react'"

const formSchema = z.object({
  checkInTime: z.string(),
  checkOutTime: z.string(),
  noShowHours: z.string().transform(Number),
  noShowRefundPercent: z.string().transform(Number),
  earlyCheckOutPolicy: z.string(),
  earlyCheckOutFee: z.string().transform(Number),
  refundApprovalRequired: z.boolean(),
  cancellationHours: z.string().transform(Number),
  cancellationFee: z.string().transform(Number),
})

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      noShowHours: 12,
      noShowRefundPercent: 0,
      earlyCheckOutPolicy: 'NO_REFUND',
      earlyCheckOutFee: 0,
      refundApprovalRequired: true,
      cancellationHours: 24,
      cancellationFee: 0,
    },
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (!response.ok) throw new Error('Failed to fetch settings')
        const data = await response.json()
        form.reset(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive',
        })
      }
    }
    fetchSettings()
  }, [form, toast])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error('Failed to save settings')

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Hotel Settings</CardTitle>
          <CardDescription>Configure your hotel&apos;s policies and operational settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="checkInTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} disabled={loading} />
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
                        <Input type="time" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="noShowHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No-show Hours</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          disabled={loading}
                          min="1"
                        />
                      </FormControl>
                      <FormDescription>
                        Hours after check-in time to mark as no-show
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="noShowRefundPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No-show Refund Percentage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          disabled={loading}
                          min="0"
                          max="100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="earlyCheckOutPolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Early Check-out Policy</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select policy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NO_REFUND">No Refund</SelectItem>
                          <SelectItem value="PARTIAL_REFUND">Partial Refund</SelectItem>
                          <SelectItem value="FULL_REFUND">Full Refund</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="earlyCheckOutFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Early Check-out Fee</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          disabled={loading}
                          min="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="cancellationHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cancellation Notice Hours</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          disabled={loading}
                          min="0"
                        />
                      </FormControl>
                      <FormDescription>
                        Hours before check-in required for cancellation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cancellationFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cancellation Fee</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          disabled={loading}
                          min="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
