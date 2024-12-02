"use client"

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
import { Users, Plus, Star } from "lucide-react"

const guests = [
  {
    id: "G-001",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 234-567-8900",
    visits: 5,
    status: "Checked In",
    loyalty: "Gold",
  },
  {
    id: "G-002",
    name: "Emma Wilson",
    email: "emma.w@email.com",
    phone: "+1 234-567-8901",
    visits: 3,
    status: "Reserved",
    loyalty: "Silver",
  },
  {
    id: "G-003",
    name: "Michael Brown",
    email: "michael.b@email.com",
    phone: "+1 234-567-8902",
    visits: 1,
    status: "Checked Out",
    loyalty: "Standard",
  },
  {
    id: "G-004",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 234-567-8903",
    visits: 8,
    status: "Reserved",
    loyalty: "Platinum",
  },
]

export default function GuestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Guests</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Guest
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">
              +180 this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">
              Current occupancy
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Members</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">864</div>
            <p className="text-xs text-muted-foreground">
              37% of total guests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Stay</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.5 Days</div>
            <p className="text-xs text-muted-foreground">
              +0.5 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guest List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Loyalty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>{guest.id}</TableCell>
                  <TableCell>{guest.name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{guest.phone}</TableCell>
                  <TableCell>{guest.visits}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        guest.status === "Checked In"
                          ? "bg-green-100 text-green-800"
                          : guest.status === "Reserved"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {guest.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        guest.loyalty === "Platinum"
                          ? "bg-purple-100 text-purple-800"
                          : guest.loyalty === "Gold"
                          ? "bg-yellow-100 text-yellow-800"
                          : guest.loyalty === "Silver"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-zinc-100 text-zinc-800"
                      }`}
                    >
                      <Star className="h-3 w-3" />
                      {guest.loyalty}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
