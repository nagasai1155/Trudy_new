'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { apiClient } from './api'

/**
 * Hook to initialize API client with NextAuth token and client_id
 * This should be called in a client component after authentication
 */
export function useAuthClient() {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'

  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Get access token from NextAuth session
      const token = (session as any).accessToken || ''
      
      // Extract client_id from user metadata or session
      // Backend expects client_id in JWT claim or user metadata
      const clientId = 
        (session.user as any)?.client_id || 
        (session.user as any)?.['https://trudy.ai/client_id'] ||
        ''

      if (token) {
        apiClient.setToken(token)
      }
      
      if (clientId) {
        apiClient.setClientId(clientId)
      }
    } else if (status === 'unauthenticated') {
      // Clear token when user logs out
      apiClient.clearToken()
    }
  }, [session, status])

  return { 
    user: session?.user || null, 
    isLoading,
    session 
  }
}

/**
 * Server-side function to get NextAuth session and configure API client
 * Use this in server components or API routes
 */
export async function getServerAuthConfig() {
  try {
    const { auth } = await import('@/lib/auth')
    const session = await auth()
    
    if (!session) {
      return { token: null, clientId: null }
    }

    const token = (session as any).accessToken || ''
    const clientId = 
      (session.user as any)?.client_id ||
      (session.user as any)?.['https://trudy.ai/client_id'] ||
      ''

    return { token, clientId }
  } catch (error) {
    console.error('Error getting auth config:', error)
    return { token: null, clientId: null }
  }
}
