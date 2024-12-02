"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Upload } from "lucide-react"
import { formatKWD } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"

const menuItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    "Price must be a valid number"
  ),
  category: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
  image: z.any().optional()
})

type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  imageUrl: string | null
  isActive: boolean
}

export default function MenuItemsPage() {
  const [loading, setLoading] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0.000",
      category: "Food",
      isActive: true,
    }
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      form.setValue("image", e.target.files)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu-items')
      if (!response.ok) throw new Error('Failed to fetch menu items')
      const data = await response.json()
      setMenuItems(data)
    } catch (error) {
      console.error('Error fetching menu items:', error)
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const onSubmit = async (values: z.infer<typeof menuItemSchema>) => {
    try {
      setLoading(true)
      
      // First upload image if exists
      let imageUrl = null
      if (values.image && values.image[0]) {
        const formData = new FormData()
        formData.append("file", values.image[0])
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData
        })
        if (!uploadResponse.ok) throw new Error("Failed to upload image")
        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.file_url
      }

      // Create menu item
      const response = await fetch('/api/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          price: parseFloat(values.price),
          imageUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create menu item')
      }

      toast({
        title: "Menu Item Created",
        description: `${values.name} has been added to the menu.`
      })

      form.reset()
      setImagePreview(null)
      fetchMenuItems()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create menu item",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleItemStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/menu-items?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      })

      if (!response.ok) throw new Error('Failed to update menu item')
      
      fetchMenuItems()
      toast({
        title: "Status Updated",
        description: `Menu item has been ${!currentStatus ? 'activated' : 'deactivated'}.`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update menu item status",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Menu Item</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Chicken Burger" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Grilled chicken with fresh vegetables..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (KWD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("image-upload")?.click()}
                            className="w-full"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                          </Button>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                            {...field}
                          />
                          {imagePreview && (
                            <div className="relative w-40 h-40">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Menu Item"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatKWD(item.price)}</p>
                        <Badge variant={item.isActive ? "default" : "secondary"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    {item.imageUrl && (
                      <div className="mt-4">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="mt-4 flex justify-between items-center">
                      <Badge variant="outline">{item.category}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleItemStatus(item.id, item.isActive)}
                      >
                        {item.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
