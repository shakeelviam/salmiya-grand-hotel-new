import type { Metadata } from "next"
import { Ubuntu } from "next/font/google"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import "./globals.css"

const ubuntu = Ubuntu({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-ubuntu',
})

export const metadata: Metadata = {
  title: "Salmiya Grand Hotel",
  description: "Hotel Management System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ubuntu.variable} font-sans bg-background`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
