"use client"

import { Eye, Pencil, Power } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActionButtonsProps {
  onView?: () => void
  onEdit?: () => void
  onToggle?: () => void
  isActive?: boolean
  hideView?: boolean
  hideEdit?: boolean
  hideToggle?: boolean
}

export function ActionButtons({
  onView,
  onEdit,
  onToggle,
  isActive = true,
  hideView = false,
  hideEdit = false,
  hideToggle = false,
}: ActionButtonsProps) {
  return (
    <div className="space-x-2">
      {!hideView && onView && (
        <Button variant="ghost" size="icon" onClick={onView}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">View</span>
        </Button>
      )}
      {!hideEdit && onEdit && (
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      )}
      {!hideToggle && onToggle && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={isActive ? "text-destructive" : "text-green-600"}
        >
          <Power className="h-4 w-4" />
          <span className="sr-only">
            {isActive ? "Disable" : "Enable"}
          </span>
        </Button>
      )}
    </div>
  )
}
