'use client'

import { useAuthClient } from '@/lib/auth-client'
import { useEffect } from 'react'

/**
 * Client component that initializes the API client with authentication
 * This should be included in the app layout to ensure API client is configured
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuthClient()

  // Show loading state while checking authentication
  if (isLoading) {
    return null // Or return a loading spinner
  }

  return <>{children}</>
}

