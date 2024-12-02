"use client"

import { Sidebar } from "@/components/ui/sidebar"
import { SidebarProvider } from "@/components/providers/sidebar-provider"
import { Toaster } from "@/components/ui/toaster"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-6">
            <div className="flex justify-end mb-4">
              <ThemeToggle />
            </div>
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}