"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  name: z.string().min(2, "Room type name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  descriptionAr: z.string().default(""),
  adultCapacity: z.coerce.number().min(1, "Adult capacity must be at least 1"),
  childCapacity: z.coerce.number().min(0, "Child capacity cannot be negative"),
  basePrice: z.coerce.number().min(0, "Base price must be greater than or equal to 0"),
  extraBedCharge: z.coerce.number().min(0, "Extra bed charge must be greater than or equal to 0"),
  amenities: z.array(z.string()).default([]),
  imageUrl: z.string().url().optional().or(z.literal('')).default(""),
  status: z.enum(["ACTIVE", "DISABLED"])
})

type FormData = z.infer<typeof formSchema>

export default function EditRoomTypePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      descriptionAr: "",
      adultCapacity: 1,
      childCapacity: 0,
      basePrice: 0,
      extraBedCharge: 0,
      amenities: [],
      imageUrl: "",
      status: "ACTIVE"
    }
  })

  useEffect(() => {
    const fetchRoomType = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/room-types/${params.roomTypeId}`)
        
        if (response.status === 401) {
          throw new Error('You must be logged in to view this page')
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || errorData.message || 'Failed to fetch room type')
        }

        const data = await response.json()
        if (!data.roomType) {
          throw new Error('Room type not found')
        }

        form.reset({
          name: data.roomType.name,
          description: data.roomType.description,
          descriptionAr: data.roomType.descriptionAr || "",
          adultCapacity: data.roomType.adultCapacity,
          childCapacity: data.roomType.childCapacity,
          basePrice: data.roomType.basePrice,
          extraBedCharge: data.roomType.extraBedCharge,
          amenities: data.roomType.amenities,
          imageUrl: data.roomType.imageUrl || "",
          status: data.roomType.status
        })
      } catch (err) {
        console.error('Error fetching room type:', err)
        setError(err instanceof Error ? err.message : 'Failed to load room type')
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load room type",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.roomTypeId) {
      fetchRoomType()
    }
  }, [params.roomTypeId, form, toast])

  const onSubmit = async (values: FormData) => {
    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch(`/api/room-types/${params.roomTypeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.status === 401) {
        throw new Error('You must be logged in to view this page')
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || 'Failed to update room type')
      }

      toast({
        title: "Success",
        description: "Room type updated successfully",
      })

      router.push('/dashboard/room-types')
      router.refresh()
    } catch (err) {
      console.error('Error updating room type:', err)
      setError(err instanceof Error ? err.message : 'Failed to update room type')
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update room type",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-8">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Room Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Room type name" {...field} />
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
                        placeholder="Room type description"
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
                        placeholder="Room type description in Arabic"
                        dir="rtl"
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
                        <Input type="number" min="1" {...field} />
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
                        <Input type="number" min="0" {...field} />
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
                      <FormLabel>Base Price</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="extraBedCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extra Bed Charge</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
