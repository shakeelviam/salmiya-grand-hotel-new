"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MenuItemForm } from "@/components/forms/menu-item-form"
import { MenuItemCard } from "@/components/cards/menu-item-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  categoryId: string
  imageUrl: string | null
  isActive: boolean
}

type Category = {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

export default function MenuItemsPage() {
  const [open, setOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchMenuItems = async () => {
    try {
      const url = new URL("/api/menu-items", window.location.origin)
      if (selectedCategory && selectedCategory !== "all") {
        url.searchParams.append("category", selectedCategory)
      }
      
      const response = await fetch(url.toString(), {
        credentials: "include",
      })
      const result = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in to view menu items")
        }
        throw new Error(result.error || "Failed to fetch menu items")
      }
      
      setMenuItems(result.data || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load menu items"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/menu-categories", {
          credentials: "include",
        })
        const result = await response.json()
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please sign in to view categories")
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
    }

    fetchCategories()
  }, [toast])

  useEffect(() => {
    fetchMenuItems()
  }, [selectedCategory, toast])

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Menu Items</h2>
          <p className="text-sm text-muted-foreground">
            Manage your menu items here
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select 
            value={selectedCategory || "all"} 
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem 
                  key={category.id} 
                  value={category.id}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Menu Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your menu
                </DialogDescription>
              </DialogHeader>
              <MenuItemForm 
                setOpen={setOpen} 
                categories={categories} 
                onSuccess={fetchMenuItems}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {menuItems.map((item) => (
          <MenuItemCard 
            key={item.id} 
            item={item} 
            category={categories.find(c => c.id === item.categoryId)?.name || ""}
          />
        ))}
      </div>
    </div>
  )
}
