import { create } from 'zustand'
import { Campaign, CreateCampaignData, UpdateCampaignData, CampaignStats } from '@/types'
import { apiClient, endpoints } from '@/lib/api'

interface CampaignState {
  campaigns: Campaign[]
  selectedCampaign: Campaign | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchCampaigns: () => Promise<void>
  getCampaign: (id: string) => Promise<void>
  createCampaign: (data: CreateCampaignData) => Promise<Campaign>
  updateCampaign: (id: string, data: UpdateCampaignData) => Promise<Campaign>
  deleteCampaign: (id: string) => Promise<void>
  setSelectedCampaign: (campaign: Campaign | null) => void
  
  // Campaign Control
  startCampaign: (id: string) => Promise<void>
  pauseCampaign: (id: string) => Promise<void>
  resumeCampaign: (id: string) => Promise<void>
  cancelCampaign: (id: string) => Promise<void>
  
  // Stats
  getCampaignStats: (id: string) => Promise<CampaignStats>
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  selectedCampaign: null,
  isLoading: false,
  error: null,
  
  fetchCampaigns: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<{ data: Campaign[] }>(endpoints.campaigns.list)
      set({ campaigns: response.data, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  getCampaign: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<{ data: Campaign }>(endpoints.campaigns.get(id))
      set({ selectedCampaign: response.data, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  createCampaign: async (data: CreateCampaignData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post<{ data: Campaign }>(
        endpoints.campaigns.create,
        data
      )
      set((state) => ({
        campaigns: [...state.campaigns, response.data],
        isLoading: false,
      }))
      return response.data
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  updateCampaign: async (id: string, data: UpdateCampaignData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.put<{ data: Campaign }>(
        endpoints.campaigns.update(id),
        data
      )
      set((state) => ({
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === id ? response.data : campaign
        ),
        selectedCampaign:
          state.selectedCampaign?.id === id
            ? response.data
            : state.selectedCampaign,
        isLoading: false,
      }))
      return response.data
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  deleteCampaign: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.delete(endpoints.campaigns.delete(id))
      set((state) => ({
        campaigns: state.campaigns.filter((campaign) => campaign.id !== id),
        selectedCampaign:
          state.selectedCampaign?.id === id ? null : state.selectedCampaign,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  setSelectedCampaign: (campaign: Campaign | null) => {
    set({ selectedCampaign: campaign })
  },
  
  startCampaign: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post<{ data: Campaign }>(
        endpoints.campaigns.start(id)
      )
      set((state) => ({
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === id ? response.data : campaign
        ),
        selectedCampaign:
          state.selectedCampaign?.id === id
            ? response.data
            : state.selectedCampaign,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  pauseCampaign: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post<{ data: Campaign }>(
        endpoints.campaigns.pause(id)
      )
      set((state) => ({
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === id ? response.data : campaign
        ),
        selectedCampaign:
          state.selectedCampaign?.id === id
            ? response.data
            : state.selectedCampaign,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  resumeCampaign: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post<{ data: Campaign }>(
        endpoints.campaigns.resume(id)
      )
      set((state) => ({
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === id ? response.data : campaign
        ),
        selectedCampaign:
          state.selectedCampaign?.id === id
            ? response.data
            : state.selectedCampaign,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  cancelCampaign: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post<{ data: Campaign }>(
        endpoints.campaigns.cancel(id)
      )
      set((state) => ({
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === id ? response.data : campaign
        ),
        selectedCampaign:
          state.selectedCampaign?.id === id
            ? response.data
            : state.selectedCampaign,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  getCampaignStats: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<{ data: CampaignStats }>(
        endpoints.campaigns.stats(id)
      )
      set({ isLoading: false })
      return response.data
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
}))

