'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useEffect } from 'react'
import { apiClient } from './api'

/**
 * Hook to initialize API client with Auth0 token and client_id
 * This should be called in a client component after authentication
 */
export function useAuthClient() {
  const { user, isLoading } = useUser()

  useEffect(() => {
    if (!isLoading && user) {
      // Get access token from Auth0
      // Note: In production, you'll need to get the actual access token
      // This is a placeholder - you may need to use getAccessToken() from Auth0 SDK
      const token = (user as any).accessToken || ''
      
      // Extract client_id from user metadata or app_metadata
      // Backend expects client_id in JWT claim or user metadata
      const clientId = 
        (user as any).app_metadata?.client_id || 
        (user as any).user_metadata?.client_id ||
        (user as any)['https://trudy.ai/client_id'] ||
        ''

      if (token) {
        apiClient.setToken(token)
      }
      
      if (clientId) {
        apiClient.setClientId(clientId)
      }
    } else if (!isLoading && !user) {
      // Clear token when user logs out
      apiClient.clearToken()
    }
  }, [user, isLoading])

  return { user, isLoading }
}

/**
 * Server-side function to get Auth0 session and configure API client
 * Use this in server components or API routes
 */
export async function getServerAuthConfig() {
  try {
    const { getSession } = await import('@auth0/nextjs-auth0')
    const session = await getSession()
    
    if (!session) {
      return { token: null, clientId: null }
    }

    const token = session.accessToken || ''
    const clientId = 
      session.user?.app_metadata?.client_id ||
      session.user?.user_metadata?.client_id ||
      session.user?.['https://trudy.ai/client_id'] ||
      ''

    return { token, clientId }
  } catch (error) {
    console.error('Error getting auth config:', error)
    return { token: null, clientId: null }
  }
}

