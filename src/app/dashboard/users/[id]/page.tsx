"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Shield } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/users/${params.id}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || errorData.message || 'Failed to fetch user')
        }

        const data = await response.json()
        if (!data.user) {
          throw new Error('User data is missing')
        }
        setUser(data.user)
      } catch (err) {
        console.error('Error fetching user:', err)
        setError(err instanceof Error ? err.message : 'Failed to load user')
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load user",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchUser()
    }
  }, [params.id, toast])

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
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-xl text-muted-foreground mb-4">
          {error || "User not found"}
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
        <Button onClick={() => router.push(`/dashboard/users/${user.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
              <Shield className="h-5 w-5 text-muted-foreground" />
              <Badge variant="outline">{user.role}</Badge>
            </div>
            <Badge variant={user.status === "ACTIVE" ? "success" : "secondary"}>
              {user.status}
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
                    Email: {user.email}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Account Details</h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Role: {user.role}
                  </p>
                  <p className="text-muted-foreground">
                    Status: {user.status}
                  </p>
                  <p className="text-muted-foreground">
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-muted-foreground">
                    Last Updated: {new Date(user.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
