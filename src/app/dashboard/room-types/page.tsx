"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RoomTypeForm } from "@/components/forms/room-type-form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"

type RoomType = {
  id: string
  name: string
  description: string
  adultCapacity: number
  childCapacity: number
  basePrice: number
  extraBedPrice: number
  createdAt: string
  updatedAt: string
}

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  async function fetchRoomTypes() {
    try {
      const response = await fetch("/api/room-types")
      if (!response.ok) {
        throw new Error("Failed to fetch room types")
      }
      const data = await response.json()
      setRoomTypes(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch room types",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this room type?")) {
      return
    }

    try {
      const response = await fetch(`/api/room-types/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete room type")
      }

      toast({
        title: "Success",
        description: "Room type deleted successfully",
      })

      fetchRoomTypes()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete room type",
        variant: "destructive",
      })
    }
  }

  function handleEdit(roomType: RoomType) {
    setSelectedRoomType(roomType)
    setDialogOpen(true)
  }

  function handleDialogClose() {
    setSelectedRoomType(null)
    setDialogOpen(false)
    fetchRoomTypes()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Room Types</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Room Type</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedRoomType ? "Edit Room Type" : "Add Room Type"}
              </DialogTitle>
            </DialogHeader>
            <RoomTypeForm
              roomType={selectedRoomType || undefined}
              onSuccess={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Adult Capacity</TableHead>
              <TableHead>Child Capacity</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Extra Bed Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell>{formatCurrency(roomType.extraBedPrice)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(roomType)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(roomType.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
