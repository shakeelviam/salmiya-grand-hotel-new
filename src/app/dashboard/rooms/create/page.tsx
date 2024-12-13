"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface RoomType {
  id: string
  name: string
  basePrice: number
  adultCapacity: number
  childCapacity: number
  amenities: string[]
  description: string
}

const formSchema = z.object({
  number: z.string().min(1, "Room number is required"),
  floor: z.string().min(1, "Floor is required"),
  roomTypeId: z.string().min(1, "Room type is required"),
  notes: z.string().optional(),
})

export default function CreateRoomPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: '',
      floor: '',
      roomTypeId: '',
      notes: '',
    },
  })

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/room-types')
        
        if (!response.ok) {
          throw new Error('Failed to fetch room types')
        }

        const { roomTypes: types } = await response.json()
        if (!Array.isArray(types)) {
          throw new Error('Invalid room types data received')
        }

        setRoomTypes(types)
      } catch (error) {
        console.error('Error fetching room types:', error)
        setError(error instanceof Error ? error.message : 'Failed to load room types')
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load room types",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRoomTypes()
  }, [toast])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedRoomType) {
      toast({
        title: "Error",
        description: "Please select a room type",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          amenities: selectedRoomType.amenities, // Use amenities from selected room type
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create room')
      }

      toast({
        title: "Success",
        description: "Room created successfully",
      })
      router.push('/dashboard/rooms')
    } catch (error) {
      console.error('Error creating room:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create room"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Update selected room type when roomTypeId changes
  const handleRoomTypeChange = (roomTypeId: string) => {
    const roomType = roomTypes.find(type => type.id === roomTypeId)
    setSelectedRoomType(roomType || null)
    form.setValue('roomTypeId', roomTypeId)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">Create Room</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-10 w-full animate-pulse bg-gray-200 rounded" />
              <div className="h-10 w-full animate-pulse bg-gray-200 rounded" />
              <div className="h-10 w-full animate-pulse bg-gray-200 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-red-500 text-lg">{error}</div>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Create Room</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roomTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type</FormLabel>
                      <Select onValueChange={handleRoomTypeChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roomTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedRoomType && (
                  <FormItem>
                    <FormLabel>Amenities (from room type)</FormLabel>
                    <div className="text-sm text-muted-foreground border rounded-md p-2">
                      {selectedRoomType.amenities.join(', ') || 'No amenities'}
                    </div>
                  </FormItem>
                )}

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional notes about the room" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <span>Creating...</span>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Room
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
