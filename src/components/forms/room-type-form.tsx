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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  adultCapacity: z.coerce.number().min(1, {
    message: "Adult capacity must be at least 1.",
  }),
  childCapacity: z.coerce.number().min(0, {
    message: "Child capacity cannot be negative.",
  }),
  basePrice: z.coerce.number().min(0, {
    message: "Base price must be greater than or equal to 0.",
  }),
  extraBedPrice: z.coerce.number().min(0, {
    message: "Extra bed price must be greater than or equal to 0.",
  }),
})

type RoomTypeFormProps = {
  onSuccess?: () => void
  roomType?: {
    id: string
    name: string
    description: string
    adultCapacity: number
    childCapacity: number
    basePrice: number
    extraBedPrice: number
  }
}

export function RoomTypeForm({ onSuccess, roomType }: RoomTypeFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: roomType?.name || "",
      description: roomType?.description || "",
      adultCapacity: roomType?.adultCapacity || 2,
      childCapacity: roomType?.childCapacity || 1,
      basePrice: roomType?.basePrice || 0,
      extraBedPrice: roomType?.extraBedPrice || 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      const url = roomType ? `/api/room-types/${roomType.id}` : '/api/room-types'
      const method = roomType ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save room type')
      }

      toast({
        title: roomType ? "Room Type Updated" : "Room Type Created",
        description: `${values.name} has been ${roomType ? 'updated' : 'created'} successfully.`
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save room type",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Deluxe Room" {...field} />
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
                  placeholder="A luxurious room with modern amenities..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="adultCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adult Capacity</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="childCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Child Capacity</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price (KD)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={0.001} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="extraBedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Extra Bed Price (KD)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={0.001} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : (roomType ? "Update Room Type" : "Create Room Type")}
        </Button>
      </form>
    </Form>
  )
}
