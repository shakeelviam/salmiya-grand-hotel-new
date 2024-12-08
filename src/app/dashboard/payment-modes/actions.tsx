"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PaymentModeForm } from "@/components/forms/payment-mode-form"
import { useToast } from "@/components/ui/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ActionButtons } from "@/components/ui/action-buttons"
import type { PaymentMode } from "./columns"

interface PaymentModeActionsProps {
  data: PaymentMode
}

export function PaymentModeActions({ data }: PaymentModeActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const toggleMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/payment-modes/${data.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !data.isActive }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update payment mode status")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-modes"] })
      toast({
        title: "Success",
        description: `Payment mode ${data.isActive ? "disabled" : "enabled"} successfully`,
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment mode status",
        variant: "destructive",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/payment-modes/${data.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete payment mode")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-modes"] })
      setShowDeleteDialog(false)
      toast({
        title: "Success",
        description: "Payment mode deleted successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete payment mode",
        variant: "destructive",
      })
    },
  })

  return (
    <>
      <ActionButtons
        onView={() => {}}
        onEdit={() => setShowEditDialog(true)}
        onToggle={() => toggleMutation.mutate()}
        isActive={data.isActive}
      />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the payment mode "{data.name}".
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Mode</DialogTitle>
          </DialogHeader>
          <PaymentModeForm
            paymentMode={data}
            setOpen={setShowEditDialog}
            onSuccess={() => {
              toast({
                title: "Success",
                description: "Payment mode updated successfully",
              })
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
