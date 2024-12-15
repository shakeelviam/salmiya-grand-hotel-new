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
  const { toast } = useToast()
  const router = useRouter()

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
                <Badge variant="success">Active</Badge>
              </TableCell>
              <TableCell className="text-right">
                <ActionButtons
                  onView={() => router.push(`/dashboard/room-types/${type.id}`)}
                  onEdit={() => router.push(`/dashboard/room-types/${type.id}/edit`)}
                  hideToggle={true}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
