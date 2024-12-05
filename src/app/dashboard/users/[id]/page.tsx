'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function UserDetailsPage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)

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
      <h1 className="text-2xl font-bold mb-4">{user.name}</h1>
      <p className="text-gray-600 mb-4">Email: {user.email}</p>
      <p className="text-gray-600 mb-4">Role: {user.role}</p>
      <p className="text-gray-600">Created At: {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  )
}
