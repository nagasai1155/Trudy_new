import { QueryClient } from '@tanstack/react-query'

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// API Base URL - Backend uses /api/v1 prefix
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Backend Response Types
export interface BackendResponse<T> {
  data: T
  meta?: {
    request_id?: string
    ts?: string
  }
}

export interface BackendError {
  error: {
    code: string
    message: string
    details?: Record<string, any>
    request_id?: string
    ts?: string
  }
}

// API Client
class ApiClient {
  private baseUrl: string
  private token: string | null = null
  private clientId: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string) {
    this.token = token
  }

  setClientId(clientId: string) {
    this.clientId = clientId
  }

  getClientId(): string | null {
    return this.clientId
  }

  clearToken() {
    this.token = null
    this.clientId = null
  }

  private generateIdempotencyKey(): string {
    return crypto.randomUUID()
  }

  private generateRequestId(): string {
    return crypto.randomUUID()
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<BackendResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    // Add request correlation ID (per .integration file)
    const requestId = options.headers?.['X-Request-Id'] as string || this.generateRequestId()
    headers['X-Request-Id'] = requestId

    // Add Authorization header
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    // Add x-client-id header (required by backend for non-agency-admin users)
    if (this.clientId) {
      headers['x-client-id'] = this.clientId
    }

    // Add idempotency key for POST/PATCH/PUT requests
    if (['POST', 'PATCH', 'PUT'].includes(options.method || '')) {
      const idempotencyKey = options.headers?.['X-Idempotency-Key'] as string || this.generateIdempotencyKey()
      headers['X-Idempotency-Key'] = idempotencyKey
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    const responseData = await response.json().catch(() => ({})) as BackendResponse<T> | BackendError

    if (!response.ok) {
      // Handle backend error format
      if ('error' in responseData) {
        const error = responseData.error
        const errorMessage = error.message || 'An error occurred'
        const errorDetails = error.details ? ` Details: ${JSON.stringify(error.details)}` : ''
        throw new Error(`${errorMessage}${errorDetails}`)
      }
      throw new Error('An error occurred')
    }

    // Backend returns {data, meta} format
    return responseData as BackendResponse<T>
  }

  async get<T>(endpoint: string): Promise<BackendResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<BackendResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<BackendResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<BackendResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<BackendResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async getAudioBlob(endpoint: string): Promise<Blob> {
    const headers: Record<string, string> = {}

    // Add request correlation ID
    headers['X-Request-Id'] = this.generateRequestId()

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    if (this.clientId) {
      headers['x-client-id'] = this.clientId
    }

    const url = `${this.baseUrl}${endpoint}`
    console.log('Fetching audio blob from:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    console.log('Audio response status:', response.status, response.statusText)
    console.log('Audio response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `Failed to fetch audio (${response.status})`
      
      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json() as BackendError
          if ('error' in errorData) {
            const error = errorData.error
            errorMessage = error.message || errorMessage
            console.error('Backend error:', error)
          }
        } else {
          // Try to read as text if not JSON
          const text = await response.text()
          if (text) {
            console.error('Error response text:', text)
            errorMessage = text.substring(0, 200) // Limit error message length
          }
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError)
      }
      
      throw new Error(errorMessage)
    }

    const blob = await response.blob()
    console.log('Audio blob created:', { size: blob.size, type: blob.type })
    
    if (blob.size === 0) {
      throw new Error('Received empty audio response from server')
    }
    
    return blob
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<BackendResponse<T>> {
    const headers: Record<string, string> = {}

    // Add request correlation ID
    headers['X-Request-Id'] = this.generateRequestId()

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    if (this.clientId) {
      headers['x-client-id'] = this.clientId
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    const responseData = await response.json().catch(() => ({})) as BackendResponse<T> | BackendError

    if (!response.ok) {
      if ('error' in responseData) {
        const error = responseData.error
        throw new Error(error.message || 'Upload failed')
      }
      throw new Error('Upload failed')
    }

    return responseData as BackendResponse<T>
  }
}

export const apiClient = new ApiClient(API_URL)

// API Endpoints - Updated to match backend structure
export const endpoints = {
  // Auth
  auth: {
    me: '/auth/me',
    clients: '/auth/clients',
    apiKeys: '/api-keys',
    providers: {
      tts: '/providers/tts',
    },
  },
  
  // Voices
  voices: {
    list: '/voices',
    get: (id: string) => `/voices/${id}`,
    create: '/voices',
    delete: (id: string) => `/voices/${id}`,
    presign: '/voices/files/presign',
    sync: (id: string) => `/voices/${id}/sync`,
    preview: (id: string, text?: string) => `/voices/${id}/preview${text ? `?text=${encodeURIComponent(text)}` : ''}`,
  },
  
  // Agents
  agents: {
    list: '/agents',
    get: (id: string) => `/agents/${id}`,
    create: '/agents',
    update: (id: string) => `/agents/${id}`,
    delete: (id: string) => `/agents/${id}`,
    sync: (id: string) => `/agents/${id}/sync`,
  },
  
  // Knowledge Bases
  knowledge: {
    list: '/kb',
    get: (id: string) => `/kb/${id}`,
    create: '/kb',
    presign: (id: string) => `/kb/${id}/files/presign`,
    ingest: (id: string) => `/kb/${id}/files/ingest`,
  },
  
  // Campaigns
  campaigns: {
    list: '/campaigns',
    get: (id: string) => `/campaigns/${id}`,
    create: '/campaigns',
    update: (id: string) => `/campaigns/${id}`,
    delete: (id: string) => `/campaigns/${id}`,
    contacts: (id: string) => `/campaigns/${id}/contacts`,
    schedule: (id: string) => `/campaigns/${id}/schedule`,
  },
  
  // Calls
  calls: {
    list: '/calls',
    get: (id: string) => `/calls/${id}`,
    create: '/calls',
    recording: (id: string) => `/calls/${id}/recording`,
    transcript: (id: string) => `/calls/${id}/transcript`,
  },
  
  // Tools
  tools: {
    list: '/tools',
    get: (id: string) => `/tools/${id}`,
    create: '/tools',
    update: (id: string) => `/tools/${id}`,
    delete: (id: string) => `/tools/${id}`,
  },
  
  // Telephony
  telephony: {
    numbers: '/telephony/numbers',
    purchase: '/telephony/numbers/purchase',
  },
  
  // Webhooks
  webhooks: {
    list: '/webhooks',
    create: '/webhooks',
    delete: (id: string) => `/webhooks/${id}`,
  },
}

