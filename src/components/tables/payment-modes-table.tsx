import { useState, useEffect } from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ActionButtons } from "@/components/ui/action-buttons"
import { useToast } from "@/components/ui/use-toast"

interface PaymentMode {
  id: string
  name: string
  description: string
  isActive: boolean
}

export function PaymentModesTable() {
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPaymentModes = async () => {
      try {
        const response = await fetch("/api/payment-modes")
        if (!response.ok) {
          throw new Error("Failed to fetch payment modes")
        }
        const data = await response.json()
        setPaymentModes(data)
      } catch (error) {
        console.error("Error fetching payment modes:", error)
        toast({
          title: "Error",
          description: "Failed to load payment modes",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentModes()
  }, [toast])

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/payment-modes/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update payment mode status")
      }

      setPaymentModes(modes => 
        modes.map(mode => 
          mode.id === id ? { ...mode, isActive: !isActive } : mode
        )
      )

      toast({
        title: "Success",
        description: `Payment mode ${isActive ? "disabled" : "enabled"} successfully`,
      })
    } catch (error) {
      console.error("Error updating payment mode status:", error)
      toast({
        title: "Error",
        description: "Failed to update payment mode status",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading payment modes...</div>
  }

  if (paymentModes.length === 0) {
    return <div>No payment modes found. Create one to get started.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paymentModes.map((mode) => (
          <TableRow key={mode.id}>
            <TableCell className="font-medium">{mode.name}</TableCell>
            <TableCell>{mode.description}</TableCell>
            <TableCell>
              <Badge variant={mode.isActive ? "success" : "destructive"}>
                {mode.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <ActionButtons
                onView={() => {}}
                onEdit={() => {}}
                onToggle={() => handleToggleStatus(mode.id, mode.isActive)}
                isActive={mode.isActive}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
