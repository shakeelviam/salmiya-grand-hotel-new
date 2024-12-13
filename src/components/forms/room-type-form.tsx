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
import { formatCurrency, parseCurrency } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  descriptionAr: z.string().default(""),
  adultCapacity: z.coerce.number().min(1, {
    message: "Adult capacity must be at least 1.",
  }),
  childCapacity: z.coerce.number().min(0, {
    message: "Child capacity cannot be negative.",
  }),
  basePrice: z.coerce.number().min(0, {
    message: "Base price must be greater than or equal to 0.",
  }),
  extraBedCharge: z.coerce.number().min(0, {
    message: "Extra bed charge must be greater than or equal to 0.",
  }),
  amenities: z.array(z.string()).default([]),
  imageUrl: z.string().url().optional().or(z.literal('')).default(""),
})

type RoomTypeFormProps = {
  onSuccess?: () => void
  roomType?: {
    id: string
    name: string
    description: string
    descriptionAr: string
    adultCapacity: number
    childCapacity: number
    basePrice: number
    extraBedCharge: number
    amenities: string[]
    imageUrl: string
  }
}

export function RoomTypeForm({ onSuccess, roomType }: RoomTypeFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: roomType?.name ?? "",
      description: roomType?.description ?? "",
      descriptionAr: roomType?.descriptionAr ?? "",
      adultCapacity: roomType?.adultCapacity ?? 2,
      childCapacity: roomType?.childCapacity ?? 1,
      basePrice: roomType?.basePrice ?? 0,
      extraBedCharge: roomType?.extraBedCharge ?? 0,
      amenities: roomType?.amenities ?? [],
      imageUrl: roomType?.imageUrl ?? "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      console.log("Submitting values:", values)

      const url = roomType ? `/api/room-types/${roomType.id}` : '/api/room-types'
      const method = roomType ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to save room type')
      }

      toast({
        title: roomType ? "Room Type Updated" : "Room Type Created",
        description: `${values.name} has been ${roomType ? 'updated' : 'created'} successfully.`,
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error saving room type:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save room type",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 h-[70vh] overflow-y-auto px-1">
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
        <FormField
          control={form.control}
          name="descriptionAr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Arabic)</FormLabel>
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
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Base Price</FormLabel>
                <FormControl>
                  <Input 
                    type="text"
                    inputMode="decimal"
                    value={formatCurrency(value)}
                    onChange={(e) => {
                      const numericValue = parseCurrency(e.target.value)
                      if (!isNaN(numericValue)) {
                        onChange(numericValue)
                      }
                    }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="extraBedCharge"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Extra Bed Charge</FormLabel>
                <FormControl>
                  <Input 
                    type="text"
                    inputMode="decimal"
                    value={formatCurrency(value)}
                    onChange={(e) => {
                      const numericValue = parseCurrency(e.target.value)
                      if (!isNaN(numericValue)) {
                        onChange(numericValue)
                      }
                    }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amenities</FormLabel>
              <FormControl>
                <Input 
                  type="text" 
                  value={field.value.join(", ")}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value ? value.split(",").map(item => item.trim()) : []);
                  }}
                  placeholder="WiFi, TV, Air Conditioning"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input 
                  type="url" 
                  placeholder="https://example.com/image.jpg"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : (roomType ? "Update Room Type" : "Create Room Type")}
        </Button>
      </form>
    </Form>
  )
}
