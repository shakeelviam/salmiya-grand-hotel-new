'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ActionButtons } from '@/components/ui/action-buttons'
import { useRouter } from 'next/navigation'

interface Room {
  id: string
  number: string
  roomType: {
    id: string
    name: string
    basePrice: number
    adultCapacity: number
    childCapacity: number
  }
  status: string
  isActive: boolean
}

export function RoomList({ rooms, onUpdate }: { rooms: Room[], onUpdate: () => void }) {
  const router = useRouter()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KW', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500'
      case 'OCCUPIED':
        return 'bg-red-500'
      case 'CLEANING':
        return 'bg-yellow-500'
      case 'MAINTENANCE':
        return 'bg-gray-500'
      default:
        return 'bg-blue-500'
    }
  }

  const handleToggleActive = async (roomId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle room status')
      }

      onUpdate()
    } catch (error) {
      console.error('Error toggling room status:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rooms</h2>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room No</TableHead>
              <TableHead>Room Type</TableHead>
              <TableHead>Adult Capacity</TableHead>
              <TableHead>Child Capacity</TableHead>
              <TableHead>Price (KWD)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.number}</TableCell>
                <TableCell>{room.roomType.name}</TableCell>
                <TableCell>{room.roomType.adultCapacity}</TableCell>
                <TableCell>{room.roomType.childCapacity}</TableCell>
                <TableCell>{formatCurrency(room.roomType.basePrice)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(room.status)}>
                    {room.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ActionButtons
                    onView={() => router.push(`/dashboard/rooms/${room.id}`)}
                    onEdit={() => router.push(`/dashboard/rooms/${room.id}/edit`)}
                    onToggle={() => handleToggleActive(room.id, room.isActive)}
                    isActive={room.isActive}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
