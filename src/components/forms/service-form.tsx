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
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  type: z.enum(["ROOM_SERVICE", "LAUNDRY", "OTHER"]),
  categoryId: z.string().min(1, "Category is required"),
})

type ServiceCategory = {
  id: string
  name: string
}

type Props = {
  onSuccess?: () => void
  initialData?: {
    id: string
    name: string
    description?: string | null
    price: number
    type: "ROOM_SERVICE" | "LAUNDRY" | "OTHER"
    categoryId: string
  }
}

export function ServiceForm({ onSuccess, initialData }: Props) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const { toast } = useToast()

  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      type: "OTHER",
      categoryId: "",
    },
  })

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/service-categories')
        if (!response.ok) throw new Error('Failed to fetch categories')
        const data = await response.json()
        setCategories(data.data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: "Error",
          description: "Failed to fetch service categories",
          variant: "destructive"
        })
      }
    }
    fetchCategories()
  }, [])

  async function onSubmit(values: z.infer<typeof serviceSchema>) {
    try {
      setLoading(true)
      const url = initialData ? `/api/services/${initialData.id}` : '/api/services'"
      const method = initialData ? 'PUT' : 'POST'"

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save service')
      }

      toast({
        title: "Success",
        description: `Service ${initialData ? 'updated' : 'created'} successfully`,
      })

      if (!initialData) {
        form.reset()
      }
      
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error saving service:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save service",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Textarea {...field} />
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
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.001"
                  placeholder="0.000"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ROOM_SERVICE">Room Service</SelectItem>
                  <SelectItem value="LAUNDRY">Laundry</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update" : "Create")}
        </Button>
      </form>
    </Form>
  )
}
