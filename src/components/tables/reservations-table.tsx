"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface ReservationsTableProps {
  reservations: Array<{
    id: string
    user: {
      name: string
    }
    roomType: {
      name: string
    }
    room?: {
      number: string
    } | null
    checkIn: string | Date
    checkOut: string | Date
    status: string
    totalAmount: number
    pendingAmount: number
  }>
  getStatusColor: (status: string) => string
  getPaymentStatus: (reservation: any) => string
  getPaymentColor: (status: string) => string
  formatDate: (date: string | Date) => string
  formatCurrency: (amount: number) => string
  ReservationActions: React.ComponentType<{ reservation: any }>
}

export function ReservationsTable({
  reservations,
  getStatusColor,
  getPaymentStatus,
  getPaymentColor,
  formatDate,
  formatCurrency,
  ReservationActions
}: ReservationsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reservation ID</TableHead>
          <TableHead>Guest</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Check In</TableHead>
          <TableHead>Check Out</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservations.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-8">
              No reservations found
            </TableCell>
          </TableRow>
        ) : (
          reservations.map((reservation) => (
            <TableRow 
              key={reservation.id}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell>{reservation.id.slice(-6)}</TableCell>
              <TableCell>{reservation.user.name}</TableCell>
              <TableCell>
                {reservation.roomType.name}
                {reservation.room && ` (Room ${reservation.room.number})`}
              </TableCell>
              <TableCell>{formatDate(reservation.checkIn)}</TableCell>
              <TableCell>{formatDate(reservation.checkOut)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(reservation.status)}>
                  {reservation.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getPaymentColor(getPaymentStatus(reservation))}>
                  {getPaymentStatus(reservation).replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                {formatCurrency(reservation.totalAmount)}
                {reservation.pendingAmount > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Pending: {formatCurrency(reservation.pendingAmount)}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <ReservationActions reservation={reservation} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
