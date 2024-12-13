"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ActionButtons } from "@/components/ui/action-buttons"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

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

interface RoomTypesTableProps {
  roomTypes: RoomType[]
  onUpdate: () => void
}

export function RoomTypesTable({ roomTypes, onUpdate }: RoomTypesTableProps) {
  const [loadingType, setLoadingType] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleToggleStatus = async (typeId: string, currentStatus: string) => {
    try {
      setLoadingType(typeId)
      
      const response = await fetch(`/api/room-types/${typeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE" 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update room type status')
      }

      toast({
        title: "Success",
        description: `Room type ${currentStatus === "ACTIVE" ? 'disabled' : 'enabled'} successfully`,
      })

      onUpdate()
    } catch (error) {
      console.error('Error updating room type status:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update room type status",
        variant: "destructive",
      })
    } finally {
      setLoadingType(null)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Room Type</TableHead>
          <TableHead>Adult Capacity</TableHead>
          <TableHead>Child Capacity</TableHead>
          <TableHead>Price Per Night</TableHead>
          <TableHead>Extra Bed Price</TableHead>
          <TableHead>Description (Arabic)</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roomTypes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
              No room types found
            </TableCell>
          </TableRow>
        ) : (
          roomTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell className="font-medium">{type.name}</TableCell>
              <TableCell>{type.adultCapacity}</TableCell>
              <TableCell>{type.childCapacity}</TableCell>
              <TableCell>{formatCurrency(type.basePrice)}</TableCell>
              <TableCell>{formatCurrency(type.extraBedCharge)}</TableCell>
              <TableCell>
                <div dir="rtl" className="text-right">
                  {type.descriptionAr}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={type.status === "ACTIVE" ? "success" : "secondary"}>
                  {type.status === "ACTIVE" ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <ActionButtons
                  onView={() => router.push(`/dashboard/room-types/${type.id}`)}
                  onEdit={() => router.push(`/dashboard/room-types/${type.id}/edit`)}
                  onToggleStatus={() => handleToggleStatus(type.id, type.status)}
                  isLoading={loadingType === type.id}
                  isActive={type.status === "ACTIVE"}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
