"use client"

import { UserForm } from "@/components/forms/user-form"
import { useRouter } from "next/navigation"

export default function CreateUserPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create User</h1>
      <UserForm
        onSuccess={() => {
          router.push('/dashboard/users')
        }}
      />
    </div>
  )
}
