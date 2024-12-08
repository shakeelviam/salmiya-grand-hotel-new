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

const formSchema = z.object({
  reservationId: z.string().min(1, "Reservation is required"),
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Amount must be greater than 0"
  ),
  paymentMode: z.enum(["CASH", "CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "MOBILE_PAYMENT", "OTHER"], {
    required_error: "Please select a payment mode",
  }),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
})

type Reservation = {
  id: string
  roomNumber: string
  totalAmount: number
  status: string
}

type Props = {
  setOpen: (open: boolean) => void
  payment?: Payment
  onSuccess?: () => void
}

export function PaymentForm({ setOpen, payment, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reservationId: payment?.reservationId || "",
      amount: payment?.amount.toString() || "",
      paymentMode: payment?.paymentMode || "CASH",
      transactionId: payment?.transactionId || "",
      notes: payment?.notes || "",
    },
  })

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch("/api/reservations?status=ACTIVE", {
          credentials: "include",
        })
        const result = await response.json()
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please sign in to view reservations")
          }
          throw new Error(result.error || "Failed to fetch reservations")
        }
        
        setReservations(result.data || [])
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load reservations"
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
      }
    }

    fetchReservations()
  }, [toast])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)

      const url = payment ? `/api/payments/${payment.id}` : "/api/payments"
      const method = payment ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reservationId: values.reservationId,
          amount: parseFloat(values.amount),
          paymentMode: values.paymentMode,
          transactionId: values.transactionId || null,
          notes: values.notes || null,
          status: "COMPLETED",
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in to manage payments")
        }
        throw new Error(result.error || `Failed to ${payment ? "update" : "create"} payment`)
      }

      toast({
        title: "Success",
        description: result.message || `Payment has been ${payment ? "updated" : "recorded"} successfully.`,
      })

      setOpen(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
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
          name="reservationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reservation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reservation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {reservations.map((reservation) => (
                    <SelectItem key={reservation.id} value={reservation.id}>
                      Room {reservation.roomNumber} - ${reservation.totalAmount}
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Mode</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transactionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter transaction ID (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any notes about this payment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            type="button"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : payment ? "Update Payment" : "Record Payment"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
