'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useToast } from '@/hooks/use-toast'

// Form validation schema
const formSchema = z.object({
  number: z.string().min(1, "Room number is required"),
  roomTypeId: z.string().min(1, "Room type is required"),
  floor: z.string().min(1, "Floor is required"),
  description: z.string().optional(),
})

interface RoomType {
  id: string
  name: string
}

interface CreateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateRoomDialog({ open, onOpenChange, onSuccess }: CreateRoomDialogProps) {
  const [loading, setLoading] = useState(false)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(true)
  const { toast } = useToast()

  // Fetch room types when dialog opens
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoadingRoomTypes(true)
        console.log('Fetching room types...')
        const response = await fetch('/api/room-types')
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to fetch room types')
        }

        const data = await response.json()
        console.log('Received room types data:', data)

        if (!data.roomTypes) {
          throw new Error('No room types data received')
        }

        const types = data.roomTypes
        console.log('Room types:', types)

        if (!Array.isArray(types)) {
          throw new Error('Room types is not an array')
        }

        if (types.length === 0) {
          console.log('Warning: No room types available')
        }

        setRoomTypes(types)
      } catch (error) {
        console.error('Error fetching room types:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load room types',
          variant: 'destructive'
        })
        // Initialize with empty array on error
        setRoomTypes([])
      } finally {
        setLoadingRoomTypes(false)
      }
    }

    // Only fetch if dialog is open
    if (open) {
      fetchRoomTypes()
    }
  }, [open, toast])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: '',
      roomTypeId: '',
      floor: '',
      description: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          status: 'AVAILABLE',
          isActive: true,
          isAvailable: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create room')
      }

      toast({
        title: 'Success',
        description: 'Room created successfully'
      })
      form.reset()
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating room:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create room',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
          <DialogDescription>
            Add a new room to the hotel inventory
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={loading} />
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
                    <Input {...field} disabled={loading} />
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
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={loadingRoomTypes}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingRoomTypes ? "Loading..." : "Select room type"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roomTypes && roomTypes.length > 0 ? (
                        roomTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          {loadingRoomTypes ? "Loading..." : "No room types available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
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
                    <Textarea {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || loadingRoomTypes}>
                {loading ? "Creating..." : "Create Room"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
