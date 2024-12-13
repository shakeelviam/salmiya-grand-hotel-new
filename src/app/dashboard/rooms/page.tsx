"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoomList } from "@/components/rooms/room-list"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Room {
  id: string
  number: string
  floor: string
  roomType: {
    id: string
    name: string
    basePrice: number
    adultCapacity: number
    childCapacity: number
  }
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING'
  isActive: boolean
}

export default function RoomsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/rooms')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || 'Failed to fetch rooms')
      }

      const data = await response.json()
      if (!data.rooms || !Array.isArray(data.rooms)) {
        throw new Error('Invalid response format')
      }
      
      setRooms(data.rooms)
    } catch (err) {
      console.error('Error fetching rooms:', err)
      setError(err instanceof Error ? err.message : 'Failed to load rooms')
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load rooms",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Rooms</h2>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </div>
        <div className="rounded-md border">
          <div className="h-[400px] w-full animate-pulse bg-muted" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Rooms</h2>
          <Button onClick={() => router.push('/dashboard/rooms/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button onClick={fetchRooms}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Rooms</h2>
          <Button onClick={() => router.push('/dashboard/rooms/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No rooms found</CardTitle>
            <CardDescription>
              Get started by adding your first room.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button onClick={() => router.push('/dashboard/rooms/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Room
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Rooms</h2>
        <Button onClick={() => router.push('/dashboard/rooms/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>
      <RoomList rooms={rooms} />
    </div>
  )
}
