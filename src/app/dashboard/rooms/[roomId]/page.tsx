"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface Room {
  id: string
  number: string
  floor: string
  description: string
  isAvailable: boolean
  status: string
  notes: string
  isActive: boolean
  roomType: {
    id: string
    name: string
    basePrice: number
    extraBedCharge: number
    description: string
  }
  createdAt: string
  updatedAt: string
}

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/rooms/${params.roomId}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch room')
        }

        const data = await response.json()
        if (!data) {
          throw new Error('Room data is missing')
        }
        setRoom(data)
      } catch (err) {
        console.error('Error fetching room:', err)
        setError(err instanceof Error ? err.message : 'Failed to load room')
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load room",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.roomId) {
      fetchRoom()
    }
  }, [params.roomId, toast])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-8">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-xl text-muted-foreground mb-4">
          {error || "Room not found"}
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500'
      case 'OCCUPIED':
        return 'bg-red-500'
      case 'MAINTENANCE':
        return 'bg-yellow-500'
      case 'CLEANING':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">Room Details</h2>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/rooms/${room.id}/edit`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Room
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room {room.number}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Basic Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Floor:</span>
                  <span>{room.floor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Room Type:</span>
                  <span>{room.roomType.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Base Price:</span>
                  <span>{formatCurrency(room.roomType.basePrice)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Extra Bed Charge:</span>
                  <span>{formatCurrency(room.roomType.extraBedCharge)}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Status Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(room.status)}>{room.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Availability:</span>
                  <Badge variant={room.status === 'AVAILABLE' ? 'success' : 'destructive'}>
                    {room.status === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Active:</span>
                  <Badge variant={room.isActive ? 'success' : 'destructive'}>
                    {room.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {room.roomType.description && (
            <div>
              <h3 className="font-medium mb-2">Room Type Description</h3>
              <p className="text-muted-foreground">{room.roomType.description}</p>
            </div>
          )}

          {room.notes && (
            <div>
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="text-muted-foreground">{room.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
