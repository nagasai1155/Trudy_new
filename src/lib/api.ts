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

// API Base URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// API Client
class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string) {
    this.token = token
  }

  clearToken() {
    this.token = null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'An error occurred')
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const headers: Record<string, string> = {}

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Upload failed')
    }

    return response.json()
  }
}

export const apiClient = new ApiClient(API_URL)

// API Endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    signup: '/auth/signup',
  },
  
  // Workspaces
  workspaces: {
    list: '/workspaces',
    get: (id: string) => `/workspaces/${id}`,
    create: '/workspaces',
    update: (id: string) => `/workspaces/${id}`,
    delete: (id: string) => `/workspaces/${id}`,
  },
  
  // Agents
  agents: {
    list: '/agents',
    get: (id: string) => `/agents/${id}`,
    create: '/agents',
    update: (id: string) => `/agents/${id}`,
    delete: (id: string) => `/agents/${id}`,
    test: (id: string) => `/agents/${id}/test`,
  },
  
  // Campaigns
  campaigns: {
    list: '/campaigns',
    get: (id: string) => `/campaigns/${id}`,
    create: '/campaigns',
    update: (id: string) => `/campaigns/${id}`,
    delete: (id: string) => `/campaigns/${id}`,
    start: (id: string) => `/campaigns/${id}/start`,
    pause: (id: string) => `/campaigns/${id}/pause`,
    resume: (id: string) => `/campaigns/${id}/resume`,
    cancel: (id: string) => `/campaigns/${id}/cancel`,
    stats: (id: string) => `/campaigns/${id}/stats`,
  },
  
  // Calls
  calls: {
    list: '/calls',
    get: (id: string) => `/calls/${id}`,
    recording: (id: string) => `/calls/${id}/recording`,
    transcript: (id: string) => `/calls/${id}/transcript`,
  },
  
  // Voices
  voices: {
    list: '/voices',
    get: (id: string) => `/voices/${id}`,
    create: '/voices',
    delete: (id: string) => `/voices/${id}`,
    preview: (id: string) => `/voices/${id}/preview`,
  },
  
  // Voice Cloning
  voiceClones: {
    list: '/voice-clones',
    get: (id: string) => `/voice-clones/${id}`,
    create: '/voice-clones',
    delete: (id: string) => `/voice-clones/${id}`,
    upload: (id: string) => `/voice-clones/${id}/upload`,
    train: (id: string) => `/voice-clones/${id}/train`,
    status: (id: string) => `/voice-clones/${id}/status`,
  },
  
  // Knowledge Base
  knowledge: {
    list: '/knowledge',
    get: (id: string) => `/knowledge/${id}`,
    create: '/knowledge',
    update: (id: string) => `/knowledge/${id}`,
    delete: (id: string) => `/knowledge/${id}`,
    upload: '/knowledge/upload',
  },
  
  // Tools
  tools: {
    list: '/tools',
    get: (id: string) => `/tools/${id}`,
    create: '/tools',
    update: (id: string) => `/tools/${id}`,
    delete: (id: string) => `/tools/${id}`,
    test: (id: string) => `/tools/${id}/test`,
  },
  
  // Analytics
  analytics: {
    overview: '/analytics/overview',
    calls: '/analytics/calls',
    campaigns: '/analytics/campaigns',
    agents: '/analytics/agents',
    costs: '/analytics/costs',
    export: '/analytics/export',
  },
  
  // Contacts
  contacts: {
    list: '/contacts',
    get: (id: string) => `/contacts/${id}`,
    create: '/contacts',
    update: (id: string) => `/contacts/${id}`,
    delete: (id: string) => `/contacts/${id}`,
    import: '/contacts/import',
    export: '/contacts/export',
  },
  
  // Notifications
  notifications: {
    list: '/notifications',
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    delete: (id: string) => `/notifications/${id}`,
  },
}

