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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

const serviceCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  type: z.enum(["FOOD", "NON_FOOD"]),
})

type Props = {
  onSuccess?: () => void
  initialData?: {
    id: string
    name: string
    description?: string | null
    type: "FOOD" | "NON_FOOD"
  }
}

export function ServiceCategoryForm({ onSuccess, initialData }: Props) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof serviceCategorySchema>>({
    resolver: zodResolver(serviceCategorySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      type: initialData?.type || "NON_FOOD",
    },
  })

  async function onSubmit(values: z.infer<typeof serviceCategorySchema>) {
    if (loading) return

    try {
      setLoading(true)
      const url = initialData ? `/api/service-categories/${initialData.id}` : '/api/service-categories'
      const method = initialData ? 'PUT' : 'POST'

      // Convert empty description to null
      const data = {
        ...values,
        description: values.description?.trim() || null
      }

      console.log('Submitting data:', data)

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save service category')
      }

      toast({
        title: "Success",
        description: result.message || `Service category ${initialData ? 'updated' : 'created'} successfully`,
      })

      if (!initialData) {
        form.reset()
      }
      
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error saving service category:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save service category",
        variant: "destructive"
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
                <Input {...field} disabled={loading} />
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
                  {...field} 
                  value={field.value || ''} 
                  disabled={loading}
                  onChange={(e) => field.onChange(e.target.value || null)}
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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FOOD">Food</SelectItem>
                  <SelectItem value="NON_FOOD">Non-Food</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update' : 'Create'} Service Category
        </Button>
      </form>
    </Form>
  )
}
