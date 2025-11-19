import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '@/lib/api'
import {
  Campaign,
  CreateCampaignData,
  UpdateCampaignData,
  CampaignStats,
} from '@/types'

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await apiClient.get<Campaign[]>(
        endpoints.campaigns.list
      )
      return response.data
    },
  })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      const response = await apiClient.get<Campaign>(
        endpoints.campaigns.get(id)
      )
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCampaignData) => {
      const response = await apiClient.post<Campaign>(
        endpoints.campaigns.create,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCampaignData }) => {
      const response = await apiClient.patch<Campaign>(
        endpoints.campaigns.update(id),
        data
      )
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', data.id] })
    },
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(endpoints.campaigns.delete(id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

