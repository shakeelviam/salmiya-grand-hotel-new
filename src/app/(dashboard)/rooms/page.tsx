'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoomGrid } from '@/components/rooms/room-grid'
import { CreateRoomDialog } from '@/components/rooms/create-room-dialog'
import { useToast } from '@/hooks/use-toast'

export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary">Rooms</h2>
          <p className="text-muted-foreground">
            Manage hotel rooms and availability
          </p>
        </div>
        <Button 
          onClick={() => setOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      <RoomGrid rooms={rooms} onUpdate={loadRooms} />
      
      <CreateRoomDialog 
        open={open} 
        onOpenChange={setOpen}
        onSuccess={() => {
          setOpen(false)
          loadRooms()
        }}
      />
    </div>
  )
}
