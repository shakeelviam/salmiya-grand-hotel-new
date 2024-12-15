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
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)
  const { toast } = useToast()

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/service-categories', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch service categories')
      }
      const result = await response.json()
      console.log('Service categories response:', result)
      if (!Array.isArray(result.data)) {
        console.error('Expected array of categories but got:', typeof result.data)
        setCategories([])
        return
      }
      setCategories(result.data || [])
    } catch (error) {
      console.error('Error fetching service categories:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch service categories",
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
    setEditingCategory(null)
    fetchCategories()
  }

  const handleEdit = (id: string) => {
    const category = categories.find(c => c.id === id)
    if (category) {
      setEditingCategory(category)
      setOpen(true)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/service-categories/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${isActive ? 'enable' : 'disable'} service category`)
      }

      toast({
        title: "Success",
        description: `Service category ${isActive ? 'enabled' : 'disabled'} successfully`,
      })
      fetchCategories()
    } catch (error) {
      console.error('Error toggling service category:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update service category",
        variant: "destructive"
      })
    }
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
              <DialogTitle>{editingCategory ? 'Edit' : 'Create New'} Service Category</DialogTitle>
            </DialogHeader>
            <ServiceCategoryForm 
              onSuccess={handleSuccess} 
              initialData={editingCategory} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <ServiceCategoryCard
            key={category.id}
            id={category.id}
            name={category.name}
            description={category.description}
            isActive={category.isActive}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
          />
        ))}
      </div>
    </div>
  )
}
