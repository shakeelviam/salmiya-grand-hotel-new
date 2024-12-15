"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReservationStatusBadge } from "./reservation-status-badge"
import { useQuery } from "@tanstack/react-query"
import { getReservations } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface CalendarReservation {
  id: string
  roomType: {
    name: string
  }
  room?: {
    number: string
  }
  user: {
    name: string
  }
  checkIn: string
  checkOut: string
  status: string
}

export function ReservationCalendar() {
  const [date, setDate] = useState<Date>(new Date())
  const [selectedReservations, setSelectedReservations] = useState<CalendarReservation[]>([])

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => getReservations(""),
  })

  useEffect(() => {
    if (reservations) {
      const filtered = reservations.filter((res: CalendarReservation) => {
        const checkIn = new Date(res.checkIn)
        const checkOut = new Date(res.checkOut)
        return (
          checkIn.toDateString() === date.toDateString() ||
          checkOut.toDateString() === date.toDateString() ||
          (date >= checkIn && date <= checkOut)
        )
      })
      setSelectedReservations(filtered)
    }
  }, [date, reservations])

  const modifiers = {
    hasReservation: (date: Date) => {
      return reservations?.some((res: CalendarReservation) => {
        const checkIn = new Date(res.checkIn)
        const checkOut = new Date(res.checkOut)
        return date >= checkIn && date <= checkOut
      })
    },
  }

  const modifiersStyles = {
    hasReservation: {
      backgroundColor: "var(--primary)",
      color: "white",
      borderRadius: "50%",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservation Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col lg:flex-row gap-4">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => date && setDate(date)}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-4">
            Reservations for {formatDate(date)}
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : selectedReservations.length > 0 ? (
            <div className="space-y-4">
              {selectedReservations.map((res) => (
                <div
                  key={res.id}
                  className="p-4 border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{res.user.name}</span>
                    <ReservationStatusBadge status={res.status} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Room: {res.room?.number || "Not assigned"} ({res.roomType.name})
                    </p>
                    <p>
                      {formatDate(res.checkIn)} - {formatDate(res.checkOut)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No reservations for this date.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
