"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Power } from "lucide-react"

type ServiceCategoryCardProps = {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  onEdit?: (id: string) => void
  onToggleActive?: (id: string, isActive: boolean) => void
}

export function ServiceCategoryCard({
  id,
  name,
  description,
  isActive,
  onEdit,
  onToggleActive,
}: ServiceCategoryCardProps) {
  return (
    <Card className={`w-full ${!isActive ? 'opacity-60' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{name}</CardTitle>
        <div className="flex space-x-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(id)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
          {onToggleActive && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleActive(id, !isActive)}
              className={`h-8 w-8 ${isActive ? 'text-destructive' : 'text-green-600'}`}
            >
              <Power className="h-4 w-4" />
              <span className="sr-only">{isActive ? 'Disable' : 'Enable'}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      {description && (
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      )}
    </Card>
  )
}
