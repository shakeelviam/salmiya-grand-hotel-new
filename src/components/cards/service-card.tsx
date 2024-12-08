"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"

type Service = {
  id: string
  name: string
  description: string | null
  price: number
  categoryId: string
  category: {
    id: string
    name: string
    type: string
  }
  isActive: boolean
}

type ServiceCardProps = {
  service: Service
  onDelete?: () => void
}

export function ServiceCard({ service, onDelete }: ServiceCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "FOOD":
        return "bg-blue-100 text-blue-800"
      case "NON_FOOD":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete service')
      }

      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-bold">{service.name}</CardTitle>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="secondary" className={getTypeColor(service.category.type)}>
              {service.category.type === "FOOD" ? "Food" : "Non-Food"}
            </Badge>
            <Badge variant="outline">
              {service.category.name}
            </Badge>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {service.description && (
          <CardDescription className="mb-2">{service.description}</CardDescription>
        )}
        <div className="text-sm font-medium">
          Price: {formatCurrency(service.price)}
        </div>
      </CardContent>
    </Card>
  )
}
