"use client"

import { useState } from "react"
import { Plus, CreditCard, Wallet, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PaymentModeForm } from "@/components/forms/payment-mode-form"
import { DataTable } from "@/components/ui/data-table"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { columns } from "./columns"
import { useQuery } from "@tanstack/react-query"

export default function PaymentModesPage() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const { data: response, isLoading } = useQuery({
    queryKey: ["payment-modes"],
    queryFn: async () => {
      const response = await fetch("/api/payment-modes")
      const data = await response.json()
      return data
    },
  })

  const paymentModes = response?.data || []
  const totalModes = paymentModes.length
  const activeModes = paymentModes.filter((mode: any) => mode.isActive).length
  const inactiveModes = totalModes - activeModes
  const defaultMode = paymentModes.filter((mode: any) => mode.isDefault).length

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Payment Modes</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Payment Mode
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalModes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Modes</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeModes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Modes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveModes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Default Mode</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{defaultMode}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment Modes Status</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={paymentModes} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Mode</DialogTitle>
          </DialogHeader>
          <PaymentModeForm 
            onSuccess={() => {
              setOpen(false)
              toast({
                title: "Success",
                description: "Payment mode created successfully.",
              })
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
