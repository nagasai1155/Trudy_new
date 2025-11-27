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
import { useAgents, useDeleteAgent } from '@/hooks/use-agents'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { Headphones, Wind, TrendingUp, Wand2, Check, Mic2, Search, Plus, MoreHorizontal, ExternalLink, Copy, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { Agent } from '@/types'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

export default function AgentsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { setSelectedAgent } = useAgentStore()
  const { data: apiAgents = [], isLoading: apiLoading, error, refetch } = useAgents()
  const deleteAgentMutation = useDeleteAgent()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewAgentModal, setShowNewAgentModal] = useState(false)
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null)
  
  // Real-time polling for agents with "creating" status
  useEffect(() => {
    const hasCreatingAgents = apiAgents.some(agent => agent.status === 'creating')
    
    if (hasCreatingAgents) {
      // Poll every 3 seconds if there are agents being created
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['agents'] })
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [apiAgents, queryClient])
  
  // Use only real agents from API
  const allAgents = apiAgents
  const isLoading = apiLoading
  
  // Handle delete agent
  const handleDeleteAgent = useCallback(async (agentId: string, agentName: string) => {
    if (!confirm(`Are you sure you want to delete "${agentName}"? This action cannot be undone.`)) {
      return
    }
    
    setDeletingAgentId(agentId)
    try {
      await deleteAgentMutation.mutateAsync(agentId)
      toast({
        title: 'Agent deleted',
        description: `"${agentName}" has been deleted successfully.`,
      })
    } catch (error) {
      toast({
        title: 'Error deleting agent',
        description: error instanceof Error ? error.message : 'Failed to delete agent. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDeletingAgentId(null)
    }
  }, [deleteAgentMutation, toast])
  
  // Handle duplicate agent
  const handleDuplicateAgent = useCallback((agent: Agent) => {
    // Navigate to new agent page with pre-filled data
    setSelectedAgent(agent)
    router.push('/agents/new?duplicate=true')
  }, [setSelectedAgent, router])
  
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
      status: agent.status,
      fullAgent: agent,
    }
  }
  
  const displayAgents = allAgents.map(formatAgentForDisplay)
  
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
    // Modal will handle navigation after creating agent
    setShowNewAgentModal(false)
  }
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'creating':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'inactive':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
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

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Error loading agents</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error instanceof Error ? error.message : 'Failed to load agents'}</p>
                </div>
              </div>
            )}

            {/* Table - Desktop/Tablet */}
            <div className="hidden md:block border border-gray-200 dark:border-gray-900 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[2fr,1fr,1.5fr,1.5fr,auto] gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-900">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Created by</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Created at
                </div>
                <div className="w-8"></div>
              </div>

              {/* Table Rows */}
              <div className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-900">
                {isLoading ? (
                  <div className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading agents...</p>
                  </div>
                ) : filteredAgents.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No agents found matching your search.' : 'No agents yet. Create your first agent to get started.'}
                  </div>
                ) : (
                  filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="grid grid-cols-[2fr,1fr,1.5fr,1.5fr,auto] gap-4 px-6 py-4 hover:bg-primary/5 cursor-pointer transition-all border-l-2 border-transparent hover:border-primary"
                    onClick={() => {
                      if (agent.fullAgent) {
                        setSelectedAgent(agent.fullAgent)
                        router.push('/agents/new')
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <AgentIcon agentId={getNumericId(agent.id)} size={40} />
                      <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</span>
                        {agent.description && (
                          <span className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-xs">{agent.description}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(agent.status || 'inactive')}`}>
                        {agent.status === 'creating' && (
                          <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                        )}
                        {agent.status || 'inactive'}
                      </span>
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
                          <DropdownMenuItem 
                            className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-primary/5"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (agent.fullAgent) {
                                setSelectedAgent(agent.fullAgent)
                                router.push('/agents/new')
                              }
                            }}
                          >
                            <ExternalLink className="mr-2 h-4 w-4 text-primary" />
                            Edit agent
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-900" />
                          <DropdownMenuItem 
                            className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (agent.fullAgent) {
                                handleDuplicateAgent(agent.fullAgent)
                              }
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate agent
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (agent.fullAgent) {
                                handleDeleteAgent(agent.id, agent.name)
                              }
                            }}
                            disabled={deletingAgentId === agent.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deletingAgentId === agent.id ? 'Deleting...' : 'Delete agent'}
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
                <div className="p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading agents...</p>
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
                    if (agent.fullAgent) {
                      setSelectedAgent(agent.fullAgent)
                      router.push('/agents/new')
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <AgentIcon agentId={getNumericId(agent.id)} size={36} />
                        <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{agent.name}</h3>
                          {agent.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-0.5">{agent.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 ml-11">
                        <p className="text-sm text-gray-600 dark:text-gray-400">By {agent.createdBy}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(agent.status || 'inactive')}`}>
                          {agent.status === 'creating' && (
                            <span className="mr-1 h-1 w-1 animate-pulse rounded-full bg-current" />
                          )}
                          {agent.status || 'inactive'}
                        </span>
                      </div>
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
                        <DropdownMenuItem 
                          className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-primary/5"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (agent.fullAgent) {
                              setSelectedAgent(agent.fullAgent)
                              router.push('/agents/new')
                            }
                          }}
                        >
                          <ExternalLink className="mr-2 h-4 w-4 text-primary" />
                          Edit agent
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-900" />
                        <DropdownMenuItem 
                          className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (agent.fullAgent) {
                              handleDuplicateAgent(agent.fullAgent)
                            }
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate agent
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (agent.fullAgent) {
                              handleDeleteAgent(agent.id, agent.name)
                            }
                          }}
                          disabled={deletingAgentId === agent.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingAgentId === agent.id ? 'Deleting...' : 'Delete agent'}
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
