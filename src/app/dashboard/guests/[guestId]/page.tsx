"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  nationality: string
  passportNumber: string
  civilId?: string
  visaNumber?: string
  passportCopy: string
  otherDocuments?: string[]
  vipStatus: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function GuestPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [guest, setGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGuest = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/guests/${params.guestId}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || errorData.message || 'Failed to fetch guest')
        }

        const data = await response.json()
        if (!data.guest) {
          throw new Error('Guest data is missing')
        }
        setGuest(data.guest)
      } catch (err) {
        console.error('Error fetching guest:', err)
        setError(err instanceof Error ? err.message : 'Failed to load guest')
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load guest",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.guestId) {
      fetchGuest()
    }
  }, [params.guestId, toast])

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

  if (error || !guest) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-xl text-muted-foreground mb-4">
          {error || "Guest not found"}
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
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
        <Button onClick={() => router.push(`/dashboard/guests/${guest.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Guest
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {guest.firstName} {guest.lastName}
              {guest.vipStatus && (
                <Star className="inline-block ml-2 h-5 w-5 text-yellow-400 fill-yellow-400" />
              )}
            </CardTitle>
            <Badge variant={guest.vipStatus ? "default" : "secondary"}>
              {guest.vipStatus ? "VIP" : "Regular"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Email: {guest.email}
                  </p>
                  <p className="text-muted-foreground">
                    Mobile: {guest.mobileNumber}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Nationality: {guest.nationality}
                  </p>
                  <p className="text-muted-foreground">
                    Passport Number: {guest.passportNumber}
                  </p>
                  {guest.civilId && (
                    <p className="text-muted-foreground">
                      Civil ID: {guest.civilId}
                    </p>
                  )}
                  {guest.visaNumber && (
                    <p className="text-muted-foreground">
                      Visa Number: {guest.visaNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Documents</h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Passport Copy: <a href={guest.passportCopy} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
                  </p>
                  {guest.otherDocuments && guest.otherDocuments.length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-1">Other Documents:</p>
                      <ul className="list-disc list-inside">
                        {guest.otherDocuments.map((doc, index) => (
                          <li key={index} className="text-muted-foreground">
                            <a href={doc} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              Document {index + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              {guest.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {guest.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
