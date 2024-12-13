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

interface RoomType {
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

export default function RoomTypePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [roomType, setRoomType] = useState<RoomType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoomType = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/room-types/${params.roomTypeId}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch room type')
        }

        const data = await response.json()
        if (!data.roomType) {
          throw new Error('Room type data is missing')
        }
        setRoomType(data.roomType)
      } catch (err) {
        console.error('Error fetching room type:', err)
        setError(err instanceof Error ? err.message : 'Failed to load room type')
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load room type",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.roomTypeId) {
      fetchRoomType()
    }
  }, [params.roomTypeId, toast])

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

  if (error || !roomType) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-xl text-muted-foreground mb-4">
          {error || "Room type not found"}
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => router.push(`/dashboard/room-types/${roomType.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Room Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{roomType.name}</CardTitle>
            <Badge variant={roomType.status === "ACTIVE" ? "success" : "secondary"}>
              {roomType.status === "ACTIVE" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{roomType.description}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Capacity</h3>
                <p className="text-muted-foreground">
                  {roomType.adultCapacity} Adults, {roomType.childCapacity} Children
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Pricing</h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Base Price: {formatCurrency(roomType.basePrice)}
                  </p>
                  <p className="text-muted-foreground">
                    Extra Bed: {formatCurrency(roomType.extraBedCharge)}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description (Arabic)</h3>
                <p className="text-muted-foreground text-right" dir="rtl">
                  {roomType.descriptionAr}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {roomType.amenities?.map((amenity, index) => (
                    <Badge key={index} variant="outline">
                      {amenity}
                    </Badge>
                  )) || <p className="text-muted-foreground">No amenities listed</p>}
                </div>
              </div>
              {roomType.imageUrl && (
                <div>
                  <h3 className="font-semibold mb-2">Room Image</h3>
                  <img
                    src={roomType.imageUrl}
                    alt={roomType.name}
                    className="rounded-lg w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
