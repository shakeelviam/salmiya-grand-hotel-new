'use client'

import { ThemeToggle } from '@/components/theme/theme-toggle'
import { UserMenu } from '@/components/auth/user-menu'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-primary">
          Salmiya Grand Hotel
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
