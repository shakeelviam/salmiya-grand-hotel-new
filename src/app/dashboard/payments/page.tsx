"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PaymentForm } from "@/components/forms/payment-form"
import { PaymentsTable } from "@/components/tables/payments-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type Payment = {
  id: string
  amount: number
  reservationId: string
  userId: string
  paymentMode: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'MOBILE_PAYMENT' | 'OTHER'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'CANCELLED'
  transactionId?: string | null
  receiptNumber?: string | null
  notes?: string | null
  refundAmount?: number | null
  refundReason?: string | null
  refundedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export default function PaymentsPage() {
  const [open, setOpen] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchPayments = async () => {
    try {
      setIsLoading(true)
      const url = new URL("/api/payments", window.location.origin)
      if (statusFilter) {
        url.searchParams.append("status", statusFilter)
      }
      
      const response = await fetch(url.toString(), {
        credentials: "include",
      })
      const result = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in to view payments")
        }
        throw new Error(result.error || "Failed to fetch payments")
      }
      
      setPayments(result.data || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load payments"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      setPayments([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [statusFilter])

  const totalPayments = payments.length
  const completedPayments = payments.filter(p => p.status === 'COMPLETED').length
  const pendingPayments = payments.filter(p => p.status === 'PENDING').length
  const refundedPayments = payments.filter(p => ['REFUNDED', 'PARTIALLY_REFUNDED'].includes(p.status)).length

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <p className="text-sm text-muted-foreground">
            Manage payments and refunds here
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select 
            value={statusFilter || "all"} 
            onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
              <SelectItem value="PARTIALLY_REFUNDED">Partially Refunded</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment</DialogTitle>
                <DialogDescription>
                  Add a new payment record to the system
                </DialogDescription>
              </DialogHeader>
              <PaymentForm 
                onSuccess={() => {
                  setOpen(false)
                  fetchPayments()
                  toast({
                    title: "Success",
                    description: "Payment added successfully",
                  })
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{refundedPayments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentsTable data={payments} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
