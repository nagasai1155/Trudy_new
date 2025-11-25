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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', clientId] })
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agents', clientId] })
      queryClient.invalidateQueries({ queryKey: ['agents', clientId, data.id] })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', clientId] })
    },
  })
}

