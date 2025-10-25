import { create } from 'zustand'
import { Agent, CreateAgentData, UpdateAgentData } from '@/types'
import { apiClient, endpoints } from '@/lib/api'

interface AgentState {
  agents: Agent[]
  selectedAgent: Agent | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchAgents: () => Promise<void>
  getAgent: (id: string) => Promise<void>
  createAgent: (data: CreateAgentData) => Promise<Agent>
  updateAgent: (id: string, data: UpdateAgentData) => Promise<Agent>
  deleteAgent: (id: string) => Promise<void>
  setSelectedAgent: (agent: Agent | null) => void
  testAgent: (id: string, phoneNumber: string) => Promise<void>
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  selectedAgent: null,
  isLoading: false,
  error: null,
  
  fetchAgents: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<{ data: Agent[] }>(endpoints.agents.list)
      set({ agents: response.data, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  getAgent: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<{ data: Agent }>(endpoints.agents.get(id))
      set({ selectedAgent: response.data, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  createAgent: async (data: CreateAgentData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post<{ data: Agent }>(endpoints.agents.create, data)
      set((state) => ({
        agents: [...state.agents, response.data],
        isLoading: false,
      }))
      return response.data
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  updateAgent: async (id: string, data: UpdateAgentData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.put<{ data: Agent }>(
        endpoints.agents.update(id),
        data
      )
      set((state) => ({
        agents: state.agents.map((agent) =>
          agent.id === id ? response.data : agent
        ),
        selectedAgent:
          state.selectedAgent?.id === id ? response.data : state.selectedAgent,
        isLoading: false,
      }))
      return response.data
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  deleteAgent: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.delete(endpoints.agents.delete(id))
      set((state) => ({
        agents: state.agents.filter((agent) => agent.id !== id),
        selectedAgent: state.selectedAgent?.id === id ? null : state.selectedAgent,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
  
  setSelectedAgent: (agent: Agent | null) => {
    set({ selectedAgent: agent })
  },
  
  testAgent: async (id: string, phoneNumber: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.post(endpoints.agents.test(id), { phoneNumber })
      set({ isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
}))

