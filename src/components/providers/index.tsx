"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SidebarProvider } from "./sidebar-provider"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <SessionProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
        {...props}
      >
        <SidebarProvider>{children}</SidebarProvider>
      </NextThemesProvider>
    </SessionProvider>
  )
}
