"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Pencil, Power } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useState } from "react"

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
  onUpdate: () => void
}

export function ServiceCard({ service, onUpdate }: ServiceCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

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

  const handleToggleStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/services/${service.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !service.isActive })
      })

      if (!response.ok) {
        throw new Error('Failed to update service status')
      }

      toast({
        title: "Success",
        description: `Service ${service.isActive ? 'disabled' : 'enabled'} successfully`
      })

      onUpdate()
    } catch (error) {
      console.error('Error updating service status:', error)
      toast({
        title: "Error",
        description: "Failed to update service status",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1 mr-4">
          <CardTitle className="text-lg font-bold">{service.name}</CardTitle>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant="secondary" className={getTypeColor(service.category.type)}>
              {service.category.type === "FOOD" ? "Food" : "Non-Food"}
            </Badge>
            <Badge variant="outline">
              {service.category.name}
            </Badge>
            <Badge variant={service.isActive ? "success" : "destructive"}>
              {service.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(`/dashboard/services/${service.id}`)}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(`/dashboard/services/${service.id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleToggleStatus}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Power className="h-4 w-4" />
            )}
            <span className="sr-only">
              {service.isActive ? "Disable" : "Enable"}
            </span>
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
