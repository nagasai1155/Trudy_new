import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '@/lib/api'
import {
  Campaign,
  CreateCampaignData,
  UpdateCampaignData,
  CampaignStats,
} from '@/types'
import { useClientId } from '@/lib/auth-client'

export function useCampaigns() {
  const clientId = useClientId()
  
  return useQuery({
    queryKey: ['campaigns', clientId],
    queryFn: async () => {
      const response = await apiClient.get<Campaign[]>(
        endpoints.campaigns.list
      )
      return response.data
    },
    enabled: !!clientId,
  })
}

export function useCampaign(id: string) {
  const clientId = useClientId()
  
  return useQuery({
    queryKey: ['campaigns', clientId, id],
    queryFn: async () => {
      const response = await apiClient.get<Campaign>(
        endpoints.campaigns.get(id)
      )
      return response.data
    },
    enabled: !!id && !!clientId,
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  const clientId = useClientId()

  return useMutation({
    mutationFn: async (data: CreateCampaignData) => {
      const response = await apiClient.post<Campaign>(
        endpoints.campaigns.create,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', clientId] })
    },
  })
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient()
  const clientId = useClientId()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCampaignData }) => {
      const response = await apiClient.patch<Campaign>(
        endpoints.campaigns.update(id),
        data
      )
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', clientId] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', clientId, data.id] })
    },
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()
  const clientId = useClientId()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(endpoints.campaigns.delete(id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', clientId] })
    },
  })
}

