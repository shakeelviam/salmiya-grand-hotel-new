"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils/currency"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MenuItemForm } from "@/components/forms/menu-item-form"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Category = {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  categoryId: string
  imageUrl: string | null
  isActive: boolean
}

type Props = {
  item: MenuItem
  category: string
}

export function MenuItemCard({ item, category }: Props) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const { toast } = useToast()

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

    if (open) {
      fetchCategories()
    }
  }, [open, toast])

  const toggleStatus = async () => {
    try {
      const response = await fetch(`/api/menu-items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !item.isActive,
        }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      toast({
        title: "Success",
        description: `${item.name} has been ${!item.isActive ? "activated" : "deactivated"}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full aspect-square object-cover"
          />
        ) : (
          <div className="w-full aspect-square bg-muted flex items-center justify-center">
            No Image
          </div>
        )}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <Badge variant={item.isActive ? "default" : "secondary"}>
            {item.isActive ? "Active" : "Inactive"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="bg-white/80">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Menu Item</DialogTitle>
                    <DialogDescription>
                      Make changes to {item.name}
                    </DialogDescription>
                  </DialogHeader>
                  <MenuItemForm 
                    setOpen={setOpen} 
                    item={item} 
                    categories={categories}
                    onSuccess={() => window.location.reload()}
                  />
                </DialogContent>
              </Dialog>
              <DropdownMenuItem onClick={toggleStatus}>
                {item.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(item.price, 'KWD', 3)}</div>
                <Badge variant={item.isActive ? "default" : "secondary"}>
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline">{category}</Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}
