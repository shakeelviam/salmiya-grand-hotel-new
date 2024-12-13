"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { UserForm } from "@/components/forms/user-form"

export default function EditUserPage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch(`/api/users?id=${id}`)
      const data = await res.json()
      setUser(data)
    }
    fetchUser()
  }, [id])

  if (!user) {
    return <p>Loading...</p>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>
      <UserForm
        user={user}
        onSuccess={() => router.push('/dashboard/users')}
      />
    </div>
  )
}
