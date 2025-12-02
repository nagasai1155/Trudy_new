import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '@/lib/api'
import { Agent, CreateAgentData, UpdateAgentData } from '@/types'
import { useClientId } from '@/lib/auth-client'

export function useAgents() {
  const clientId = useClientId()
  
  return useQuery({
    queryKey: ['agents', clientId],
    queryFn: async () => {
      const response = await apiClient.get<Agent[]>(endpoints.agents.list)
      return response.data
    },
    enabled: !!clientId, // Only fetch when clientId is available
    staleTime: 1000 * 60, // Consider data fresh for 60 seconds (longer to prevent flickering)
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for better performance
    refetchOnMount: false, // Don't refetch if data is fresh (prevents flickering)
    refetchOnReconnect: true, // Refetch on reconnect
    // Don't use placeholderData - it causes flickering
    // Instead, we'll handle loading state in the component using cached data
    retry: 1, // Only retry once on failure
  })
}

export function useAgent(id: string) {
  const clientId = useClientId()
  
  return useQuery({
    queryKey: ['agents', clientId, id],
    queryFn: async () => {
      const response = await apiClient.get<Agent>(endpoints.agents.get(id))
      return response.data
    },
    enabled: !!id && !!clientId,
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()
  const clientId = useClientId()

  return useMutation({
    mutationFn: async (data: CreateAgentData) => {
      const response = await apiClient.post<Agent>(endpoints.agents.create, data)
      return response.data
    },
    onSuccess: (newAgent) => {
      // Optimistically update the cache for instant UI feedback
      queryClient.setQueryData<Agent[]>(['agents', clientId], (oldAgents = []) => {
        // Check if agent already exists (prevent duplicates)
        const exists = oldAgents.some(agent => agent.id === newAgent.id)
        if (exists) {
          return oldAgents.map(agent => agent.id === newAgent.id ? newAgent : agent)
        }
        return [newAgent, ...oldAgents]
      })
      // Refetch to ensure we have the latest data
      queryClient.refetchQueries({ queryKey: ['agents', clientId] })
    },
  })
}

export function useUpdateAgent() {
  const queryClient = useQueryClient()
  const clientId = useClientId()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAgentData }) => {
      const response = await apiClient.patch<Agent>(
        endpoints.agents.update(id),
        data
      )
      return response.data
    },
    onSuccess: (updatedAgent) => {
      // Optimistically update the cache for instant UI feedback
      queryClient.setQueryData<Agent[]>(['agents', clientId], (oldAgents = []) => {
        return oldAgents.map(agent => agent.id === updatedAgent.id ? updatedAgent : agent)
      })
      // Update individual agent cache
      queryClient.setQueryData<Agent>(['agents', clientId, updatedAgent.id], updatedAgent)
      // Refetch to ensure consistency
      queryClient.refetchQueries({ queryKey: ['agents', clientId] })
    },
  })
}

export function useDeleteAgent() {
  const queryClient = useQueryClient()
  const clientId = useClientId()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(endpoints.agents.delete(id))
    },
    onSuccess: (_, deletedId) => {
      // Optimistically remove from cache for instant UI feedback
      queryClient.setQueryData<Agent[]>(['agents', clientId], (oldAgents = []) => {
        return oldAgents.filter(agent => agent.id !== deletedId)
      })
      // Refetch to ensure consistency
      queryClient.refetchQueries({ queryKey: ['agents', clientId] })
    },
  })
}

export function useSyncAgentWithUltravox() {
  const queryClient = useQueryClient()
  const clientId = useClientId()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<Agent>(endpoints.agents.sync(id), {})
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', clientId] })
    },
  })
}

