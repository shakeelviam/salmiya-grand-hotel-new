"use client"

import { Eye, Pencil, Power, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ActionButtonsProps {
  onView?: () => void
  onEdit?: () => void
  onToggleStatus?: () => void
  isActive?: boolean
  isLoading?: boolean
}

export function ActionButtons({
  onView,
  onEdit,
  onToggleStatus,
  isActive = true,
  isLoading = false,
}: ActionButtonsProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-end space-x-2">
        {onView && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation()
                  onView()
                }}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Details</p>
            </TooltipContent>
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
        )}
        {onToggleStatus && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleStatus()
                }}
                disabled={isLoading}
                className={isActive ? "text-destructive hover:text-destructive/90" : "text-green-600 hover:text-green-700"}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isActive ? "Disable" : "Enable"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isActive ? "Disable" : "Enable"}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
