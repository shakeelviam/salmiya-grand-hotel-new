"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { RoomTypeForm } from "@/components/forms/room-type-form"
import { formatCurrency } from "@/lib/utils/currency"

type RoomType = {
  id: string
  name: string
  description: string
  adultCapacity: number
  childCapacity: number
  basePrice: number
  extraBedCharge: number
  createdAt: string
  updatedAt: string
}

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchRoomTypes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/room-types')
      if (!response.ok) throw new Error('Failed to fetch room types')
      const data = await response.json()
      setRoomTypes(data)
    } catch (error) {
      console.error('Error fetching room types:', error)
      toast({
        title: "Error",
        description: "Failed to fetch room types",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  const handleRoomTypeCreated = () => {
    setIsDialogOpen(false)
    fetchRoomTypes()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Room Types</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Room Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Room Type</DialogTitle>
            </DialogHeader>
            <RoomTypeForm onSuccess={handleRoomTypeCreated} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Adult Capacity</TableHead>
              <TableHead>Child Capacity</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Extra Bed Charge</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roomTypes.map((roomType) => (
              <TableRow key={roomType.id}>
                <TableCell>{roomType.name}</TableCell>
                <TableCell>{roomType.description}</TableCell>
                <TableCell>{roomType.adultCapacity}</TableCell>
                <TableCell>{roomType.childCapacity}</TableCell>
                <TableCell>{formatCurrency(roomType.basePrice)}</TableCell>
                <TableCell>{formatCurrency(roomType.extraBedCharge)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
