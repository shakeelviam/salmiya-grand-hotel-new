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
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, Pencil, Power } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Guest {
  id: string
  name: string
  email: string
  phone: string
  nationality: string
  passportNumber: string
  civilId?: string
  visaNumber?: string
  passportCopy: string
  otherDocuments: string[]
  vipStatus: boolean
  notes?: string
  createdAt: string
  isActive: boolean
}

interface GuestsTableProps {
  guests: Guest[]
  onUpdate: () => void
}

export function GuestsTable({ guests, onUpdate }: GuestsTableProps) {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleToggleStatus = async (guestId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/guests/${guestId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update guest status')
      }

      toast({
        title: "Success",
        description: `Guest ${currentStatus ? 'disabled' : 'enabled'} successfully`,
      })

      onUpdate()
    } catch (error) {
      console.error('Error updating guest status:', error)
      toast({
        title: "Error",
        description: "Failed to update guest status",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile Number</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest) => (
            <TableRow key={guest.id}>
              <TableCell className="font-medium">{guest.name}</TableCell>
              <TableCell>{guest.email}</TableCell>
              <TableCell>{guest.phone}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedGuest(guest)
                    setViewDialogOpen(true)
                  }}
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    // TODO: Implement edit functionality
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleStatus(guest.id, guest.isActive)}
                  className={guest.isActive ? "text-destructive" : "text-green-600"}
                >
                  <Power className="h-4 w-4" />
                  <span className="sr-only">
                    {guest.isActive ? "Disable" : "Enable"}
                  </span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guest Details</DialogTitle>
          </DialogHeader>
          {selectedGuest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">Name</div>
                  <div>{selectedGuest.name}</div>
                </div>
                <div>
                  <div className="font-medium">Email</div>
                  <div>{selectedGuest.email}</div>
                </div>
                <div>
                  <div className="font-medium">Phone</div>
                  <div>{selectedGuest.phone}</div>
                </div>
                <div>
                  <div className="font-medium">Nationality</div>
                  <div>{selectedGuest.nationality}</div>
                </div>
                <div>
                  <div className="font-medium">Passport Number</div>
                  <div>{selectedGuest.passportNumber}</div>
                </div>
                {selectedGuest.civilId && (
                  <div>
                    <div className="font-medium">Civil ID</div>
                    <div>{selectedGuest.civilId}</div>
                  </div>
                )}
                {selectedGuest.visaNumber && (
                  <div>
                    <div className="font-medium">Visa Number</div>
                    <div>{selectedGuest.visaNumber}</div>
                  </div>
                )}
                <div>
                  <div className="font-medium">Status</div>
                  <div>{selectedGuest.isActive ? "Active" : "Disabled"}</div>
                </div>
                <div>
                  <div className="font-medium">VIP Status</div>
                  <div>{selectedGuest.vipStatus ? "VIP" : "Regular"}</div>
                </div>
              </div>
              {selectedGuest.notes && (
                <div>
                  <div className="font-medium">Notes</div>
                  <div className="text-sm text-muted-foreground">{selectedGuest.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
