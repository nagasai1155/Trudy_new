'use client'

// Auth0 UserProvider temporarily disabled
// import { UserProvider } from '@auth0/nextjs-auth0/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { queryClient } from '@/lib/api'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // <UserProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          enableColorScheme
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    // </UserProvider>
  )
}

