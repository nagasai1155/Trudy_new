import { create } from 'zustand'
import { Agent, CreateAgentData, UpdateAgentData } from '@/types'
import { apiClient, endpoints } from '@/lib/api'

interface AgentState {
  agents: any[] // Using any for now since we're using mock data
  selectedAgent: any | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchAgents: () => Promise<void>
  getAgent: (id: string) => Promise<void>
  createAgent: (data: CreateAgentData) => Promise<Agent>
  updateAgent: (id: string, data: UpdateAgentData) => Promise<Agent>
  deleteAgent: (id: string) => Promise<void>
  addAgent: (data: any) => any // Add local agent without API, returns new agent
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
  
  addAgent: (data: any) => {
    // Create a new agent with local ID and timestamp
    const newAgent = {
      ...data,
      id: Date.now(), // Simple ID generation
      createdAt: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      createdBy: data.createdBy || 'You',
    }
    set((state) => ({
      agents: [newAgent, ...state.agents],
      selectedAgent: newAgent, // Automatically select the newly created agent
    }))
    return newAgent
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

