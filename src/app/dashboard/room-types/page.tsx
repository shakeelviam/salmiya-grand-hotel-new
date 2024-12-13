"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { RoomTypeForm } from "@/components/forms/room-type-form"
import { RoomTypesTable } from "@/components/tables/room-types-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type RoomType = {
  id: string
  name: string
  description: string
  descriptionAr: string
  adultCapacity: number
  childCapacity: number
  basePrice: number
  extraBedCharge: number
  amenities: string[]
  imageUrl: string | null
  status: string
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
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || error.error || 'Failed to fetch room types')
      }
      
      const data = await response.json()
      
      if (!data || !data.roomTypes) {
        throw new Error('Invalid response format')
      }

      setRoomTypes(data.roomTypes)
    } catch (error) {
      console.error('Error fetching room types:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch room types",
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[150px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Room Types</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Room Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Room Type</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <RoomTypeForm
                onSuccess={() => {
                  setIsDialogOpen(false)
                  fetchRoomTypes()
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Types</CardTitle>
        </CardHeader>
        <CardContent>
          <RoomTypesTable 
            roomTypes={roomTypes}
            onUpdate={fetchRoomTypes}
          />
        </CardContent>
      </Card>
    </div>
  )
}
