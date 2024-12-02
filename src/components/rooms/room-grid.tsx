'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bed, Users, Coffee } from "lucide-react"

interface Room {
  id: string
  number: string
  type: string
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING'
  capacity: {
    adult: number
    child: number
  }
}

interface RoomGridProps {
  rooms: Room[]
  onUpdate: () => void
}

export function RoomGrid({ rooms, onUpdate }: RoomGridProps) {
  // Helper function to determine badge color based on status
  const getStatusColor = (status: string) => {
    const colors = {
      AVAILABLE: 'bg-success text-success-foreground',
      OCCUPIED: 'bg-primary text-primary-foreground',
      MAINTENANCE: 'bg-warning text-warning-foreground',
      CLEANING: 'bg-accent text-accent-foreground'
    }
    return colors[status] || 'bg-muted text-muted-foreground'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-all">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-semibold text-primary">
                  Room {room.number}
                </h3>
                <p className="text-muted-foreground">{room.type}</p>
              </div>
              <Badge className={getStatusColor(room.status)}>
                {room.status}
              </Badge>
            </div>

            <div className="mt-4 flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{room.capacity.adult + room.capacity.child} Guests</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4" />
                <span>{room.capacity.adult} Adults</span>
              </div>
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                <span>Room Service</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 hover:bg-primary/10"
              >
                View Details
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Book Now
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
