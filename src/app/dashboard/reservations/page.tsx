"use client"

import { useState, useEffect, Suspense } from "react"
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
import { CalendarDays, Plus, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ActionButtons } from "@/components/ui/action-buttons"
import { useToast } from "@/components/ui/use-toast"
import { getReservations } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils/currency"
import { ReservationActions } from "@/components/reservations/reservation-actions"
import { ReservationsTable } from "@/components/tables/reservations-table"

interface Reservation {
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
  totalAmount: number
  advanceAmount: number
  pendingAmount: number
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  // Stats
  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === "CONFIRMED").length,
    checkedIn: reservations.filter(r => r.status === "CHECKED_IN").length,
    pending: reservations.filter(r => r.status === "RESERVED_UNPAID").length,
    cancelled: reservations.filter(r => r.status === "CANCELLED").length,
  }

  useEffect(() => {
    loadReservations()
  }, [statusFilter])

  async function loadReservations() {
    try {
      setLoading(true)
      const data = await getReservations(statusFilter)
      setReservations(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reservations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredReservations = reservations.filter(reservation =>
    reservation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (reservation.room?.number.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    reservation.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    const colors = {
      RESERVED_UNPAID: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      CHECKED_IN: "bg-green-100 text-green-800",
      CHECKED_OUT: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getPaymentStatus = (reservation: Reservation) => {
    if (reservation.pendingAmount === 0) return "PAID"
    if (reservation.advanceAmount > 0) return "PARTIALLY_PAID"
    return "UNPAID"
  }

  const getPaymentColor = (status: string) => {
    const colors = {
      PAID: "bg-green-100 text-green-800",
      PARTIALLY_PAID: "bg-yellow-100 text-yellow-800",
      UNPAID: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reservations</h2>
        <Button onClick={() => router.push("/dashboard/reservations/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Reservation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.confirmed / stats.total) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkedIn}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.checkedIn / stats.total) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.pending / stats.total) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.cancelled / stats.total) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reservations</CardTitle>
          <div className="flex items-center space-x-4 pt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reservations..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select 
  value={statusFilter || "ALL"} 
  onValueChange={(value) => setStatusFilter(value === "ALL" ? "" : value)}
>
  <SelectTrigger className="w-[180px]">
    <Filter className="mr-2 h-4 w-4" />
    <SelectValue placeholder="Filter by status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="ALL">All Statuses</SelectItem>
    <SelectItem value="RESERVED_UNPAID">Reserved (Unpaid)</SelectItem>
    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
    <SelectItem value="CHECKED_IN">Checked In</SelectItem>
    <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
    <SelectItem value="CANCELLED">Cancelled</SelectItem>
  </SelectContent>
</Select>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <ReservationsTable 
              reservations={filteredReservations}
              getStatusColor={getStatusColor}
              getPaymentStatus={getPaymentStatus}
              getPaymentColor={getPaymentColor}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              ReservationActions={ReservationActions}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
