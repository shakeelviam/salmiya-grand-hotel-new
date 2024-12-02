'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Sidebar, SidebarTrigger } from '@/components/ui/sidebar'
import { SidebarProvider } from '@/components/providers/sidebar-provider'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1">
          <div className="flex items-center border-b px-4 h-14">
            <SidebarTrigger />
            <h1 className="ml-4 text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="p-8">
            <h2 className="text-3xl font-bold">Welcome to Salmiya Grand Hotel</h2>
            <p className="mt-4 text-gray-600">
              Manage your hotel operations from this dashboard.
            </p>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
