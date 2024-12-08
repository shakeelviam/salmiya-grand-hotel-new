"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Users, Plus, Star } from "lucide-react"
import { nationalities } from "@/lib/nationalities"
import { GuestsTable } from "@/components/tables/guests-table"

const guestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobileNumber: z.string().min(8, "Mobile number must be at least 8 digits"),
  civilId: z.string().optional(),
  email: z.string().email("Invalid email address"),
  visaNumber: z.string().optional(),
  passportNumber: z.string().min(1, "Passport number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  passportCopy: z.any().refine((file) => file?.length > 0, "Passport copy is required"),
  otherDocuments: z.any().optional(),
})

type GuestFormValues = z.infer<typeof guestSchema>

interface Guest {
  id: string
  name: string
  email: string
  phone: string
  nationality: string
  passportNumber: string
  civilId?: string
  visaNumber?: string
  passportCopy: string
  otherDocuments: string[]
  vipStatus: boolean
  notes?: string
  createdAt: string
}

export default function GuestsPage() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])

  const fetchGuests = async () => {
    try {
      const response = await fetch("/api/guests")
      if (!response.ok) {
        throw new Error("Failed to fetch guests")
      }
      const data = await response.json()
      setGuests(data)
    } catch (error) {
      console.error("Error fetching guests:", error)
      toast({
        title: "Error",
        description: "Failed to fetch guests",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchGuests()
  }, [])

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobileNumber: "",
      civilId: "",
      email: "",
      visaNumber: "",
      passportNumber: "",
      nationality: "",
    },
  })

  const onSubmit = async (data: GuestFormValues) => {
    try {
      setLoading(true)
      
      // Create a single FormData instance for all data
      const formData = new FormData()
      
      // Add all text fields
      formData.append("guestName", `${data.firstName} ${data.lastName}`)
      formData.append("email", data.email)
      formData.append("phone", data.mobileNumber)
      formData.append("nationality", data.nationality)
      formData.append("passportNumber", data.passportNumber)
      if (data.civilId) formData.append("civilId", data.civilId)
      if (data.visaNumber) formData.append("visaNumber", data.visaNumber)
      
      // Add passport copy
      if (data.passportCopy?.[0]) {
        formData.append("passportCopy", data.passportCopy[0])
      }
      
      // Add other documents
      if (data.otherDocuments?.length) {
        Array.from(data.otherDocuments).forEach((file) => {
          formData.append("otherDocuments", file)
        })
      }

      // Create guest with all data
      const response = await fetch("/api/guests", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to create guest")
      }

      // Success handling
      toast({
        title: "Success",
        description: "Guest has been created successfully",
      })
      
      // Reset form, close dialog, and refresh guest list
      setOpen(false)
      form.reset()
      fetchGuests()
    } catch (error) {
      console.error("Guest creation error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create guest",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Guests</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Guest
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Guest</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+965 xxxx xxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="civilId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Civil ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Civil ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visaNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visa Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Visa Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="passportNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passport Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Passport Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select nationality" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {nationalities.map((nationality) => (
                              <SelectItem key={nationality} value={nationality}>
                                {nationality}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="passportCopy"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Passport Copy</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => onChange(e.target.files)}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otherDocuments"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Other Documents</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            multiple
                            onChange={(e) => onChange(e.target.files)}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create Guest"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <GuestsTable guests={guests} onUpdate={fetchGuests} />
      </div>
    </div>
  )
}