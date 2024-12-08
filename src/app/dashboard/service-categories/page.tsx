"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ServiceCategoryForm } from "@/components/forms/service-category-form"
import { ServiceCategoryCard } from "@/components/cards/service-category-card"

type ServiceCategory = {
  id: string
  name: string
  description: string | null
  type: string
  isActive: boolean
  services: {
    id: string
    name: string
    price: number
  }[]
}

export default function ServiceCategoriesPage() {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/service-categories')
      if (!response.ok) throw new Error('Failed to fetch service categories')
      const result = await response.json()
      setCategories(result.data || [])
    } catch (error) {
      console.error('Error fetching service categories:', error)
      toast({
        title: "Error",
        description: "Failed to fetch service categories",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSuccess = () => {
    setOpen(false)
    fetchCategories()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Service Categories</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Service Category</DialogTitle>
            </DialogHeader>
            <ServiceCategoryForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <ServiceCategoryCard
            key={category.id}
            category={category}
            onUpdate={fetchCategories}
          />
        ))}
      </div>
    </div>
  )
}
