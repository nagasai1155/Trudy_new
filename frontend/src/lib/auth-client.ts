'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
import { apiClient } from './api'

// Global cache for clientId to prevent duplicate fetches
let cachedClientId: string | null = null
let isFetchingClientId = false
const clientIdPromise: { current: Promise<string | null> | null } = { current: null }

/**
 * Hook to initialize API client with NextAuth token and client_id
 * This should be called in a client component after authentication
 */
export function useAuthClient() {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const [clientId, setClientId] = useState<string | null>(cachedClientId)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      // For Google OAuth, use idToken (JWT) instead of accessToken
      const token = (session as any).idToken || (session as any).accessToken || ''
      
      // Extract client_id from user metadata or session
      const extractedClientId = 
        (session.user as any)?.client_id || 
        (session.user as any)?.['https://trudy.ai/client_id'] ||
        (session.user as any)?.clientId ||
        null

      if (token) {
        apiClient.setToken(token)
      }
      
      if (extractedClientId) {
        // Use client_id from session
        apiClient.setClientId(extractedClientId)
        setClientId(extractedClientId)
        cachedClientId = extractedClientId
      } else if (token && !cachedClientId && !hasFetchedRef.current) {
        // Only fetch once if not already fetching
        hasFetchedRef.current = true
        
        if (!isFetchingClientId) {
          isFetchingClientId = true
          
          // Create a single promise for all concurrent requests
          if (!clientIdPromise.current) {
            clientIdPromise.current = apiClient.get('/auth/me')
              .then((response) => {
                const userData = response.data as any
                if (userData?.client_id) {
                  cachedClientId = userData.client_id
                  apiClient.setClientId(userData.client_id)
                  // Store in session for future use
                  if (session.user) {
                    (session.user as any).client_id = userData.client_id
                  }
                  return userData.client_id
                }
                return null
              })
              .catch((error) => {
                console.error('Failed to get user info:', error)
                return null
              })
              .finally(() => {
                isFetchingClientId = false
                // Clear promise after 100ms to allow state updates
                setTimeout(() => {
                  clientIdPromise.current = null
                }, 100)
              })
          }
          
          // Wait for the shared promise
          clientIdPromise.current.then((id) => {
            if (id) {
              setClientId(id)
            }
          })
        }
      } else if (cachedClientId) {
        // Use cached clientId
        setClientId(cachedClientId)
        apiClient.setClientId(cachedClientId)
      }
    } else if (status === 'unauthenticated') {
      // Clear everything on logout
      apiClient.clearToken()
      setClientId(null)
      cachedClientId = null
      hasFetchedRef.current = false
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
// This now uses the cached value to prevent duplicate requests
export function useClientId(): string | null {
  const { clientId } = useAuthClient()
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

    // For Google OAuth, use idToken (JWT) instead of accessToken
    const token = (session as any).idToken || (session as any).accessToken || ''
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
