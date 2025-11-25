'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NewAgentModal } from '@/components/forms/new-agent-modal'
import { AgentIcon } from '@/components/agent-icon'
import { useAgentStore } from '@/stores/agent-store'
import { useAgents } from '@/hooks/use-agents'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Headphones, Wind, TrendingUp, Wand2, Check, Mic2, Search, Plus, MoreHorizontal, ExternalLink, Copy, Trash2 } from 'lucide-react'
import { Agent } from '@/types'

// Default dummy agents to show when no agents are available
const dummyAgents: Agent[] = [
  {
    id: 'dummy-1',
    client_id: 'client-1',
    name: 'Customer Support Agent',
    description: 'Handles customer inquiries and support tickets',
    voice_id: 'voice-1',
    system_prompt: 'You are a helpful customer support agent.',
    model: 'gpt-4',
    tools: [],
    knowledge_bases: [],
    status: 'active',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dummy-2',
    client_id: 'client-2',
    name: 'Sales Representative',
    description: 'Engages with potential customers and handles sales inquiries',
    voice_id: 'voice-2',
    system_prompt: 'You are a friendly sales representative.',
    model: 'gpt-4',
    tools: [],
    knowledge_bases: [],
    status: 'active',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dummy-3',
    client_id: 'client-3',
    name: 'Appointment Scheduler',
    description: 'Schedules appointments and manages calendar bookings',
    voice_id: 'voice-3',
    system_prompt: 'You are an efficient appointment scheduler.',
    model: 'gpt-3.5-turbo',
    tools: [],
    knowledge_bases: [],
    status: 'active',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dummy-4',
    client_id: 'client-4',
    name: 'Lead Qualification Bot',
    description: 'Qualifies leads and gathers initial information',
    voice_id: 'voice-4',
    system_prompt: 'You are a lead qualification specialist.',
    model: 'gpt-4',
    tools: [],
    knowledge_bases: [],
    status: 'active',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dummy-5',
    client_id: 'client-5',
    name: 'Technical Support Agent',
    description: 'Provides technical assistance and troubleshooting help',
    voice_id: 'voice-5',
    system_prompt: 'You are a knowledgeable technical support agent.',
    model: 'gpt-4',
    tools: [],
    knowledge_bases: [],
    status: 'active',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
]

export default function AgentsPage() {
  const router = useRouter()
  const { agents: storeAgents, setSelectedAgent, fetchAgents, isLoading: storeLoading } = useAgentStore()
  const { data: apiAgents = [], isLoading: apiLoading, error } = useAgents()
  const [view, setView] = useState<'list'>('list')
  const [localSelectedAgent, setLocalSelectedAgent] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewAgentModal, setShowNewAgentModal] = useState(false)
  
  // Fetch agents from API on mount
  useEffect(() => {
    if (!apiAgents.length && !apiLoading && !error) {
      fetchAgents().catch(console.error)
    }
  }, [apiAgents.length, apiLoading, error, fetchAgents])
  
  // Use API agents if available, otherwise fall back to store agents, then dummy agents
  const allAgents = apiAgents.length > 0 
    ? apiAgents 
    : storeAgents.length > 0 
    ? storeAgents 
    : dummyAgents
  const isLoading = apiLoading || storeLoading
  
  // Format agent for display (convert backend format to display format)
  const formatAgentForDisplay = (agent: Agent) => {
    const createdDate = agent.created_at 
      ? new Date(agent.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      : 'Unknown'
    
    return {
      id: agent.id,
      name: agent.name || 'Unnamed Agent',
      description: agent.description || '',
      agentName: agent.name || 'Agent',
      createdBy: 'You', // TODO: Get from user session when available
      createdAt: createdDate,
    }
  }
  
  const displayAgents = allAgents.map(formatAgentForDisplay)
  
  const currentAgent = displayAgents.find(agent => agent.id === localSelectedAgent)
  
  // Convert string ID to number for AgentIcon component
  const getNumericId = (id: string): number => {
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
  
  const filteredAgents = displayAgents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.agentName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAgentTypeSelect = (type: 'blank' | 'personal' | 'business') => {
    // Just close the modal - agent is already added to store
    setShowNewAgentModal(false)
  }

  return (
    <AppLayout>
        <div className="bg-white dark:bg-black xl:-mt-[72px] min-h-screen">
          <div className="px-6 py-6">
            {/* New Agent Modal */}
            <NewAgentModal 
              isOpen={showNewAgentModal}
              onClose={() => setShowNewAgentModal(false)}
              onSelectType={handleAgentTypeSelect}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-1">Agents</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create and manage your AI agents</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 gap-2 flex-1 sm:flex-initial"
                  onClick={() => setShowNewAgentModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  New agent
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Table - Desktop/Tablet */}
            <div className="hidden md:block border border-gray-200 dark:border-gray-900 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[2fr,1.5fr,1.5fr,auto] gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-900">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Created by</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Created at
                </div>
                <div className="w-8"></div>
              </div>

              {/* Table Rows */}
              <div className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-900">
                {isLoading ? (
                  <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading agents...
                  </div>
                ) : filteredAgents.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No agents found matching your search.' : 'No agents yet. Create your first agent to get started.'}
                  </div>
                ) : (
                  filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="grid grid-cols-[2fr,1.5fr,1.5fr,auto] gap-4 px-6 py-4 hover:bg-primary/5 cursor-pointer transition-all border-l-2 border-transparent hover:border-primary"
                    onClick={() => {
                      const fullAgent = allAgents.find(a => a.id === agent.id)
                      if (fullAgent) {
                        setSelectedAgent(fullAgent as any)
                        router.push('/agents/new')
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <AgentIcon agentId={getNumericId(agent.id)} size={40} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{agent.createdBy}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{agent.createdAt}</div>
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-black border-gray-200 dark:border-gray-900">
                          <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-primary/5">
                            <ExternalLink className="mr-2 h-4 w-4 text-primary" />
                            SDK docs
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-primary/5">
                            <ExternalLink className="mr-2 h-4 w-4 text-primary" />
                            Conversation history
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-900" />
                          <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate agent
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete agent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Loading agents...
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No agents found matching your search.' : 'No agents yet. Create your first agent to get started.'}
                </div>
              ) : (
                filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="border border-gray-200 dark:border-gray-900 rounded-lg p-4 hover:bg-primary/5 hover:border-primary/40 cursor-pointer transition-all"
                  onClick={() => {
                    const fullAgent = allAgents.find(a => a.id === agent.id)
                    if (fullAgent) {
                      setSelectedAgent(fullAgent as any)
                      router.push('/agents/new')
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <AgentIcon agentId={getNumericId(agent.id)} size={36} />
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{agent.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-11">By {agent.createdBy}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-black border-gray-200 dark:border-gray-900">
                        <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-primary/5">
                          <ExternalLink className="mr-2 h-4 w-4 text-primary" />
                          SDK docs
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-primary/5">
                          <ExternalLink className="mr-2 h-4 w-4 text-primary" />
                          Conversation history
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-900" />
                        <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate agent
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete agent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    {agent.createdAt}
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      </AppLayout>
  )
}
