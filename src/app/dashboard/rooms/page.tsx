"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoomGrid } from "@/components/rooms/room-grid"
import { CreateRoomDialog } from "@/components/rooms/create-room-dialog"
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
  const [rooms, setRooms] = useState<Room[]>([])
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadRooms()
  }, [])

  async function loadRooms() {
    try {
      const res = await fetch('/api/rooms')
      if (!res.ok) throw new Error('Failed to load rooms')
      const data = await res.json()
      setRooms(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not load rooms',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Rooms</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      <RoomGrid rooms={rooms} onUpdate={loadRooms} />

      <CreateRoomDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          loadRooms()
          setOpen(false)
        }}
      />
    </div>
  )
}
