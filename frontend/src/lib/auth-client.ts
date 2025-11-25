'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { apiClient } from './api'

/**
 * Hook to initialize API client with NextAuth token and client_id
 * This should be called in a client component after authentication
 */
export function useAuthClient() {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Get access token from NextAuth session
      // NextAuth stores it in session.accessToken (from JWT callback)
      const token = (session as any).accessToken || ''
      
      // Extract client_id from user metadata or session
      // Backend expects client_id in JWT claim or user metadata
      const extractedClientId = 
        (session.user as any)?.client_id || 
        (session.user as any)?.['https://trudy.ai/client_id'] ||
        (session.user as any)?.clientId ||
        null

      if (token) {
        apiClient.setToken(token)
      }
      
      if (extractedClientId) {
        apiClient.setClientId(extractedClientId)
        setClientId(extractedClientId)
      } else if (token) {
        // If we have a token but no client_id, try to fetch it from /auth/me
        apiClient.get('/auth/me')
          .then((response) => {
            const userData = response.data as any
            if (userData?.client_id) {
              apiClient.setClientId(userData.client_id)
              setClientId(userData.client_id)
            }
          })
          .catch(() => {
            // Silently fail - client_id might not be available yet
          })
      }
    } else if (status === 'unauthenticated') {
      // Clear token when user logs out
      apiClient.clearToken()
      setClientId(null)
    }
  }, [session, status])

  return { 
    user: session?.user || null, 
    isLoading,
    session,
    clientId
  }
}

// Export function to get clientId for use in React Query keys
export function useClientId(): string | null {
  const { data: session, status } = useSession()
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      const token = (session as any).accessToken || ''
      const extractedClientId = 
        (session.user as any)?.client_id || 
        (session.user as any)?.['https://trudy.ai/client_id'] ||
        (session.user as any)?.clientId ||
        null
      
      if (extractedClientId) {
        setClientId(extractedClientId)
      } else if (token) {
        // Fetch from backend if not in session
        apiClient.get('/auth/me')
          .then((response) => {
            const userData = response.data as any
            if (userData?.client_id) {
              setClientId(userData.client_id)
            }
          })
          .catch(() => {
            // Silently fail
          })
      }
    } else {
      setClientId(null)
    }
  }, [session, status])

  return clientId
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
