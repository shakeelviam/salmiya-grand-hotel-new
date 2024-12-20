"use client"

import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { 
  Clock, 
  CalendarCheck, 
  DoorOpen, 
  DoorClosed,
  Ban,
  AlertTriangle,
  FileEdit,
  ChevronDown
} from "lucide-react"

export type ReservationStatus =
  | "UNCONFIRMED"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED"
  | "NO_SHOW"
  | "EXTENDED"
  | "ROOM_CHANGED"
  | "EARLY_CHECKOUT"

interface StatusConfig {
  label: string
  icon: JSX.Element
  color: string
}

const statusConfig: Record<ReservationStatus, StatusConfig> = {
  UNCONFIRMED: {
    label: "Unconfirmed",
    icon: <FileEdit className="h-4 w-4" />,
    color: "bg-gray-100 hover:bg-gray-200 text-gray-900"
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: <CalendarCheck className="h-4 w-4" />,
    color: "bg-green-100 hover:bg-green-200 text-green-900"
  },
  CHECKED_IN: {
    label: "Checked In",
    icon: <DoorOpen className="h-4 w-4" />,
    color: "bg-blue-100 hover:bg-blue-200 text-blue-900"
  },
  CHECKED_OUT: {
    label: "Checked Out",
    icon: <DoorClosed className="h-4 w-4" />,
    color: "bg-purple-100 hover:bg-purple-200 text-purple-900"
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <Ban className="h-4 w-4" />,
    color: "bg-red-100 hover:bg-red-200 text-red-900"
  },
  NO_SHOW: {
    label: "No Show",
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "bg-orange-100 hover:bg-orange-200 text-orange-900"
  },
  EXTENDED: {
    label: "Extended",
    icon: <CalendarCheck className="h-4 w-4" />,
    color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-900"
  },
  ROOM_CHANGED: {
    label: "Room Changed",
    icon: <DoorOpen className="h-4 w-4" />,
    color: "bg-teal-100 hover:bg-teal-200 text-teal-900"
  },
  EARLY_CHECKOUT: {
    label: "Early Checkout",
    icon: <DoorClosed className="h-4 w-4" />,
    color: "bg-rose-100 hover:bg-rose-200 text-rose-900"
  }
}

const allowedTransitions: Record<ReservationStatus, ReservationStatus[]> = {
  UNCONFIRMED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED", "NO_SHOW"],
  CHECKED_IN: ["CHECKED_OUT", "ROOM_CHANGED", "EXTENDED", "EARLY_CHECKOUT"],
  CHECKED_OUT: [], // Terminal state
  CANCELLED: [], // Terminal state
  NO_SHOW: [], // Terminal state
  EXTENDED: ["CHECKED_OUT", "ROOM_CHANGED", "EARLY_CHECKOUT"],
  ROOM_CHANGED: ["CHECKED_OUT", "EXTENDED", "EARLY_CHECKOUT"],
  EARLY_CHECKOUT: [] // Terminal state
}

interface ReservationStatusBadgeProps {
  status: ReservationStatus
  reservationId: string
  onStatusChange?: (newStatus: ReservationStatus) => Promise<void>
  disabled?: boolean
}

export function ReservationStatusBadge({
  status,
  reservationId,
  onStatusChange,
  disabled = false
}: ReservationStatusBadgeProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const config = statusConfig[status]
  const availableTransitions = allowedTransitions[status]

  const handleStatusChange = async (newStatus: ReservationStatus) => {
    try {
      setLoading(true)
      await onStatusChange?.(newStatus)
      toast({
        title: 'Status Updated',
        description: `Reservation status changed to ${statusConfig[newStatus].label}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update reservation status',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!availableTransitions.length || disabled) {
    return (
      <Badge 
        className={`${config.color} flex items-center gap-1 px-2 py-1`}
      >
        {config.icon}
        <span>{config.label}</span>
      </Badge>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`${config.color} flex items-center gap-1 px-2 py-1`}
          disabled={loading}
        >
          {config.icon}
          <span>{config.label}</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableTransitions.map((newStatus) => (
          <DropdownMenuItem
            key={newStatus}
            onClick={() => handleStatusChange(newStatus)}
            disabled={loading}
            className={`flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}
          >
            {statusConfig[newStatus].icon}
            {statusConfig[newStatus].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
