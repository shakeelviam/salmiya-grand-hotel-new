"use client"

import { useState } from "react"
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

const formSchema = z.object({
  name: z.string().min(1, "Category name is required").max(255, "Category name is too long"),
  description: z.string().optional().transform(val => val || null),
  isActive: z.boolean().default(true),
})

type MenuCategory = {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

type Props = {
  setOpen: (open: boolean) => void
  category?: MenuCategory
  onSuccess?: () => void
}

export function MenuCategoryForm({ setOpen, category, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      isActive: category?.isActive ?? true,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      const url = category 
        ? `/api/menu-categories/${category.id}` 
        : "/api/menu-categories"
      const method = category ? "PUT" : "POST"
      
      // Log form values
      console.log("Form values:", values)
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name.trim(),
          description: values.description?.trim() || null,
          isActive: values.isActive ?? true,
        }),
        credentials: "include",
      })

      let result
      try {
        const text = await response.text()
        console.log("Raw response:", text)
        result = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error("Error parsing response:", parseError)
        throw new Error("Invalid response from server")
      }

      console.log("Response status:", response.status)
      console.log("Parsed response:", result)

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          throw new Error("A category with this name already exists")
        }
        if (response.status === 401) {
          throw new Error("Please sign in to manage menu categories")
        }
        if (response.status === 400 && result.details) {
          const validationErrors = result.details.map((err: any) => err.message).join(", ")
          throw new Error(`Validation error: ${validationErrors}`)
        }
        if (response.status === 503) {
          throw new Error("Database connection error. Please try again later.")
        }
        throw new Error(result.error || `Failed to ${category ? "update" : "create"} category`)
      }

      toast({
        title: "Success",
        description: result.message || `Category ${values.name} has been ${category ? "updated" : "created"} successfully`,
      })
      
      setOpen(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Form submission error:", error)
      console.error("Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        stack: error instanceof Error ? error.stack : undefined
      })

      const message = error instanceof Error ? error.message : "An unexpected error occurred"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter category name" {...field} />
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
                  placeholder="Enter category description" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            type="button"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : category ? "Save Changes" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
