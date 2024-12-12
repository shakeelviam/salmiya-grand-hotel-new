"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface ReservationActionsProps {
  reservation: {
    id: string
    status: string
    roomId?: string
    pendingAmount: number
    roomTypeId: string
    totalAmount: number
  }
}

// Form schemas for different actions
const paymentSchema = z.object({
  amount: z.coerce
    .number()
    .min(0.01, "Amount must be greater than 0")
    .max(1000000, "Amount is too large"),
  paymentModeId: z.string().min(1, "Payment mode is required"),
})

const checkInSchema = z.object({
  roomId: z.string().min(1, "Room is required"),
})

const checkOutSchema = z.object({
  settleAmount: z.coerce
    .number()
    .min(0, "Amount cannot be negative"),
})

const changeRoomSchema = z.object({
  newRoomId: z.string().min(1, "New room is required"),
  reason: z.string().min(1, "Reason is required"),
})

const extendStaySchema = z.object({
  newCheckOutDate: z.date({
    required_error: "New check-out date is required",
  }),
})

export function ReservationActions({ reservation }: ReservationActionsProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showCheckInDialog, setShowCheckInDialog] = useState(false)
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false)
  const [showChangeRoomDialog, setShowChangeRoomDialog] = useState(false)
  const [showExtendStayDialog, setShowExtendStayDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Initialize forms
  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
  })

  const checkInForm = useForm<z.infer<typeof checkInSchema>>({
    resolver: zodResolver(checkInSchema),
  })

  const checkOutForm = useForm<z.infer<typeof checkOutSchema>>({
    resolver: zodResolver(checkOutSchema),
    defaultValues: {
      settleAmount: reservation.pendingAmount,
    },
  })

  const changeRoomForm = useForm<z.infer<typeof changeRoomSchema>>({
    resolver: zodResolver(changeRoomSchema),
  })

  const extendStayForm = useForm<z.infer<typeof extendStaySchema>>({
    resolver: zodResolver(extendStaySchema),
  })

  // Add room fetching with loading and error states
  const { data: roomsResponse, isLoading: isLoadingRooms, error: roomsError } = useQuery({
    queryKey: ["available-rooms", reservation.roomTypeId, showCheckInDialog],
    queryFn: async () => {
      const response = await fetch(`/api/rooms/available?roomTypeId=${reservation.roomTypeId}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to fetch rooms")
      }
      const data = await response.json()
      return data
    },
    enabled: showCheckInDialog && !!reservation.roomTypeId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 1
  })

  const availableRooms = roomsResponse?.data || []

  const handlePayment = async (values: z.infer<typeof paymentSchema>) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/reservations/${reservation.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to process payment")
      }

      toast({ title: "Success", description: `Payment of ${formatCurrency(values.amount)} processed successfully` })
      setShowPaymentDialog(false)
      paymentForm.reset()
      queryClient.invalidateQueries(["reservations"])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckIn = async (values: z.infer<typeof checkInSchema>) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/reservations/${reservation.id}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to check in")
      }

      toast({ title: "Success", description: "Guest checked in successfully" })
      setShowCheckInDialog(false)
      checkInForm.reset()
      queryClient.invalidateQueries(["reservations"])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check in",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckOut = async (values: z.infer<typeof checkOutSchema>) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/reservations/${reservation.id}/check-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to check out");
      }

      toast({
        title: "Success",
        description: data.message || `Guest checked out successfully with a settlement of ${formatCurrency(values.settleAmount)}`
      });
      
      // Close dialog and refresh data
      setShowCheckOutDialog(false);
      checkOutForm.reset();
      queryClient.invalidateQueries(["reservations"]);
      
      // Force a page refresh to update all states
      window.location.reload();
    } catch (error) {
      console.error("Check-out error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check out",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRoom = async (values: z.infer<typeof changeRoomSchema>) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/reservations/${reservation.id}/change-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to change room")
      }

      toast({ title: "Success", description: "Room changed successfully" })
      setShowChangeRoomDialog(false)
      changeRoomForm.reset()
      queryClient.invalidateQueries(["reservations"])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change room",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExtendStay = async (values: z.infer<typeof extendStaySchema>) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/reservations/${reservation.id}/extend-stay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to extend stay")
      }

      toast({ title: "Success", description: "Stay extended successfully" })
      setShowExtendStayDialog(false)
      extendStayForm.reset()
      queryClient.invalidateQueries(["reservations"])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to extend stay",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/reservations/${reservation.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to cancel reservation");
      }

      toast({
        title: "Success",
        description: data.message || "Reservation cancelled successfully"
      });
      
      // Close dialog and refresh data
      setShowCancelDialog(false);
      queryClient.invalidateQueries(["reservations"]);
      
      // Force a page refresh to update all states
      window.location.reload();
    } catch (error) {
      console.error("Cancel error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel reservation",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefund = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/reservations/${reservation.id}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to process refund");
      }

      toast({
        title: "Success",
        description: data.message || `Refund processed successfully`
      });
      
      // Close dialog and refresh data
      setShowRefundDialog(false);
      queryClient.invalidateQueries(["reservations"]);
      
      // Force a page refresh to update all states
      window.location.reload();
    } catch (error) {
      console.error("[REFUND_ERROR]", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process refund",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableActions = () => {
    switch (reservation.status) {
      case "UNCONFIRMED":
        return [
          {
            label: "Make Payment to Confirm",
            onClick: () => setShowPaymentDialog(true),
          },
          {
            label: "Cancel",
            onClick: () => setShowCancelDialog(true),
          },
        ]
      case "CONFIRMED":
        return [
          {
            label: "Check In",
            onClick: () => setShowCheckInDialog(true),
          },
          {
            label: "Cancel and Refund",
            onClick: () => setShowRefundDialog(true),
          },
        ]
      case "CHECKED_IN":
        return [
          {
            label: "Pay and Check Out",
            onClick: () => setShowCheckOutDialog(true),
          },
          {
            label: "Extend Stay",
            onClick: () => setShowExtendStayDialog(true),
          },
          {
            label: "Change Room",
            onClick: () => setShowChangeRoomDialog(true),
          },
          {
            label: "Early Check Out",
            onClick: () => setShowCheckOutDialog(true),
          },
        ]
      default:
        return []
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {getAvailableActions().map((action, index) => (
            <DropdownMenuItem key={index} onClick={action.onClick}>
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Payment Dialog */}
      <Dialog 
        open={showPaymentDialog} 
        onOpenChange={(open) => {
          setShowPaymentDialog(open)
          if (!open) {
            paymentForm.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
            <DialogDescription>
              Process payment for the reservation
            </DialogDescription>
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(handlePayment)} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="paymentModeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Add payment modes dynamically */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    "Process Payment"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog 
        open={showCheckInDialog} 
        onOpenChange={(open) => {
          setShowCheckInDialog(open)
          if (!open) {
            checkInForm.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In</DialogTitle>
            <DialogDescription>
              Select a room to check in the guest
            </DialogDescription>
          </DialogHeader>
          <Form {...checkInForm}>
            <form onSubmit={checkInForm.handleSubmit(handleCheckIn)} className="space-y-4">
              <FormField
                control={checkInForm.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingRooms ? "Loading rooms..." : "Select room"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingRooms ? (
                          <SelectItem value="loading" disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading rooms...
                          </SelectItem>
                        ) : roomsError ? (
                          <SelectItem value="error" disabled>
                            Error loading rooms
                          </SelectItem>
                        ) : availableRooms.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No rooms available
                          </SelectItem>
                        ) : (
                          availableRooms.map((room: any) => (
                            <SelectItem key={room.id} value={room.id}>
                              Room {room.number} - {room.roomType.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isLoadingRooms || !!roomsError || !checkInForm.watch("roomId")}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking In...
                    </>
                  ) : (
                    "Check In"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog 
        open={showCheckOutDialog} 
        onOpenChange={(open) => {
          setShowCheckOutDialog(open)
          if (!open) {
            checkOutForm.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Out</DialogTitle>
            <DialogDescription>
              Settle remaining bills and complete check-out
            </DialogDescription>
          </DialogHeader>
          <Form {...checkOutForm}>
            <form onSubmit={checkOutForm.handleSubmit(handleCheckOut)} className="space-y-4">
              <FormField
                control={checkOutForm.control}
                name="settleAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Settlement Amount</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking Out...
                    </>
                  ) : (
                    "Complete Check Out"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Change Room Dialog */}
      <Dialog 
        open={showChangeRoomDialog} 
        onOpenChange={(open) => {
          setShowChangeRoomDialog(open)
          if (!open) {
            changeRoomForm.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Room</DialogTitle>
            <DialogDescription>
              Select a new room for the guest
            </DialogDescription>
          </DialogHeader>
          <Form {...changeRoomForm}>
            <form onSubmit={changeRoomForm.handleSubmit(handleChangeRoom)} className="space-y-4">
              <FormField
                control={changeRoomForm.control}
                name="newRoomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Room</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingRooms ? "Loading rooms..." : "Select new room"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingRooms ? (
                          <SelectItem value="loading" disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading rooms...
                          </SelectItem>
                        ) : roomsError ? (
                          <SelectItem value="error" disabled>
                            Error loading rooms
                          </SelectItem>
                        ) : availableRooms.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No rooms available
                          </SelectItem>
                        ) : (
                          availableRooms.map((room: any) => (
                            <SelectItem key={room.id} value={room.id}>
                              Room {room.number} - {room.roomType.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={changeRoomForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Change</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isLoadingRooms || !!roomsError || !changeRoomForm.watch("newRoomId")}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Room...
                    </>
                  ) : (
                    "Change Room"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Extend Stay Dialog */}
      <Dialog 
        open={showExtendStayDialog} 
        onOpenChange={(open) => {
          setShowExtendStayDialog(open)
          if (!open) {
            extendStayForm.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Stay</DialogTitle>
            <DialogDescription>
              Extend the guest's stay duration
            </DialogDescription>
          </DialogHeader>
          <Form {...extendStayForm}>
            <form onSubmit={extendStayForm.handleSubmit(handleExtendStay)} className="space-y-4">
              <FormField
                control={extendStayForm.control}
                name="newCheckOutDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Check-out Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extending Stay...
                    </>
                  ) : (
                    "Extend Stay"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog 
        open={showCancelDialog} 
        onOpenChange={(open) => {
          setShowCancelDialog(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this reservation?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              No, Keep It
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog 
        open={showRefundDialog} 
        onOpenChange={(open) => {
          setShowRefundDialog(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel and refund this reservation?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              No, Keep It
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRefund}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Refund...
                </>
              ) : (
                "Yes, Process Refund"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
