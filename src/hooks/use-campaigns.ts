import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '@/lib/api'
import {
  Campaign,
  CreateCampaignData,
  UpdateCampaignData,
  CampaignStats,
  ApiResponse,
} from '@/types'

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Campaign[]>>(
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
      const response = await apiClient.get<ApiResponse<Campaign>>(
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
      const response = await apiClient.post<ApiResponse<Campaign>>(
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
      const response = await apiClient.put<ApiResponse<Campaign>>(
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

export function useStartCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<ApiResponse<Campaign>>(
        endpoints.campaigns.start(id)
      )
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', data.id] })
    },
  })
}

export function usePauseCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<ApiResponse<Campaign>>(
        endpoints.campaigns.pause(id)
      )
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', data.id] })
    },
  })
}

export function useResumeCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<ApiResponse<Campaign>>(
        endpoints.campaigns.resume(id)
      )
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', data.id] })
    },
  })
}

export function useCancelCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<ApiResponse<Campaign>>(
        endpoints.campaigns.cancel(id)
      )
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', data.id] })
    },
  })
}

export function useCampaignStats(id: string) {
  return useQuery({
    queryKey: ['campaigns', id, 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CampaignStats>>(
        endpoints.campaigns.stats(id)
      )
      return response.data
    },
    enabled: !!id,
    refetchInterval: 5000, // Refresh every 5 seconds
  })
}

