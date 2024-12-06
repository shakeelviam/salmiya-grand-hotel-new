"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MenuCategoryForm } from "@/components/forms/menu-category-form"
import { columns } from "./columns"
import { useToast } from "@/components/ui/use-toast"

type MenuCategory = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export default function MenuCategoriesPage() {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const { toast } = useToast()

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/menu-categories", {
        credentials: "include",
      })
      const result = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in to view menu categories")
        }
        throw new Error(result.error || "Failed to fetch categories")
      }
      
      setCategories(result.data || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load categories"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Menu Categories</h2>
          <p className="text-sm text-muted-foreground">
            Manage your menu categories here
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Menu Category</DialogTitle>
              <DialogDescription>
                Add a new category for menu items
              </DialogDescription>
            </DialogHeader>
            <MenuCategoryForm setOpen={setOpen} onSuccess={fetchCategories} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-6">
        <DataTable columns={columns} data={categories} />
      </div>
    </div>
  )
}
