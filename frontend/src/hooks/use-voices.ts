import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '@/lib/api'
import { Voice } from '@/types'
import { useClientId } from '@/lib/auth-client'

export function useVoices() {
  const clientId = useClientId()
  
  return useQuery({
    queryKey: ['voices', clientId],
    queryFn: async () => {
      const response = await apiClient.get<Voice[]>(endpoints.voices.list)
      return response.data
    },
    enabled: !!clientId, // Only fetch when clientId is available
  })
}

export function useVoice(id: string) {
  const clientId = useClientId()
  
  return useQuery({
    queryKey: ['voices', clientId, id],
    queryFn: async () => {
      const response = await apiClient.get<Voice>(endpoints.voices.get(id))
      return response.data
    },
    enabled: !!id && !!clientId,
  })
}

export function useCreateVoice() {
  const queryClient = useQueryClient()
  const clientId = useClientId()

  return useMutation({
    mutationFn: async (data: {
      name: string
      strategy: 'external' | 'native' | 'auto'
      source: {
        type: 'external' | 'native'
        provider_voice_id?: string
        samples?: Array<{
          text: string
          s3_key: string
          duration_seconds: number
        }>
      }
      provider_overrides?: {
        provider?: string
      }
    }) => {
      const response = await apiClient.post<Voice>(endpoints.voices.create, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voices', clientId] })
    },
  })
}

export function useDeleteVoice() {
  const queryClient = useQueryClient()
  const clientId = useClientId()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(endpoints.voices.delete(id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voices', clientId] })
    },
  })
}

export function useSyncVoiceWithUltravox() {
  const queryClient = useQueryClient()
  const clientId = useClientId()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<Voice>(endpoints.voices.sync(id), {})
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voices', clientId] })
    },
  })
}

