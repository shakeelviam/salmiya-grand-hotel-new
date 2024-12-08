"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { BedDouble, Plus } from "lucide-react"
import { RoomQRCode } from "@/components/rooms/qr-code"
import { RoomForm } from "@/components/forms/room-form"
import { useToast } from "@/components/ui/use-toast"

type Room = {
  id: string
  number: string
  type: string
  status: string
  guest: string
  checkIn: string
  checkOut: string
}

export default function RoomsPage() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [roomTypes, setRoomTypes] = useState([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchRooms = async () => {
    try {
      console.log("Fetching rooms...")
      const response = await fetch('/api/rooms')
      if (!response.ok) throw new Error('Failed to fetch rooms')
      const data = await response.json()
      console.log("Fetched rooms:", data)
      setRooms(data)
    } catch (error) {
      console.error('Error fetching rooms:', error)
      toast({
        title: "Error",
        description: "Failed to fetch rooms",
        variant: "destructive"
      })
    }
  }

  // Fetch room types and rooms
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching rooms and room types...")
        setLoading(true)
        const [roomTypesResponse, roomsResponse] = await Promise.all([
          fetch('/api/room-types'),
          fetch('/api/rooms')
        ])

        if (!roomTypesResponse.ok || !roomsResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const [roomTypesData, roomsData] = await Promise.all([
          roomTypesResponse.json(),
          roomsResponse.json()
        ])

        console.log("Fetched room types:", roomTypesData)
        console.log("Fetched rooms:", roomsData)

        setRoomTypes(roomTypesData)
        setRooms(roomsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create room')
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: `Room ${formData.get('number')} has been created successfully`,
      })

      setIsDialogOpen(false)
      fetchRooms()
    } catch (error) {
      console.error('Error creating room:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create room",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Rooms</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
            </DialogHeader>
            <RoomForm 
              roomTypes={roomTypes} 
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{room.number}</CardTitle>
              <BedDouble className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <RoomQRCode roomId={room.id} size={150} />
                <p className="text-sm text-muted-foreground">
                  Scan to access room service
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.number}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        room.status === "Available"
                          ? "bg-green-100 text-green-800"
                          : room.status === "Occupied"
                          ? "bg-blue-100 text-blue-800"
                          : room.status === "Maintenance"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {room.status}
                    </span>
                  </TableCell>
                  <TableCell>{room.guest}</TableCell>
                  <TableCell>{room.checkIn}</TableCell>
                  <TableCell>{room.checkOut}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
