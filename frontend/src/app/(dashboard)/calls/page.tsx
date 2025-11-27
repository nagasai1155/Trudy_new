'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CallDetailsPanel } from '@/components/calls/call-details-panel'
import { Search, Play, Download, Phone, Loader2, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { CALL_STATUSES } from '@/constants'
import { formatDate, formatDuration, formatPhoneNumber } from '@/lib/utils'
import { useCalls, useCreateCall, Call } from '@/hooks/use-calls'
import { useAgents } from '@/hooks/use-agents'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthClient } from '@/lib/auth-client'
import { CreateCallModal } from '@/components/calls/create-call-modal'

export default function CallsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { isLoading: authLoading, clientId } = useAuthClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  const { data: callsData, isLoading: callsLoading } = useCalls({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    limit: 100,
  })
  
  const calls = callsData?.data || []
  const { data: agents = [] } = useAgents()
  const createCallMutation = useCreateCall()

  // Real-time polling for active calls
  useEffect(() => {
    const hasActiveCalls = calls.some(call => 
      ['queued', 'ringing', 'in_progress'].includes(call.status)
    )
    
    if (hasActiveCalls) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['calls', clientId] })
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [calls, queryClient, clientId])

  // Get agent name for display
  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    return agent?.name || 'Unknown Agent'
  }

  const filteredCalls = calls.filter(call => {
    const matchesSearch = 
      call.phone_number.includes(searchQuery) ||
      getAgentName(call.agent_id).toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const isLoading = authLoading || (!clientId && !callsLoading) || callsLoading

  const getStatusBadge = (status: string) => {
    const statusConfig = CALL_STATUSES.find(s => s.value === status)
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary'
    
    if (status === 'completed') variant = 'default'
    if (status === 'failed') variant = 'destructive'
    if (status === 'in_progress' || status === 'ringing') variant = 'default'

    return (
      <Badge variant={variant} className="capitalize">
        {status === 'in_progress' && (
          <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
        )}
        {statusConfig?.label || status}
      </Badge>
    )
  }

  const handleCallClick = (call: Call) => {
    setSelectedCall(call)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setSelectedCall(null)
  }

  const handleCreateCall = async (data: { agent_id: string; phone_number: string; direction: 'inbound' | 'outbound' }) => {
    try {
      // Validate phone number format (E.164: +1234567890)
      if (!data.phone_number.match(/^\+[1-9]\d{1,14}$/)) {
        toast({
          title: 'Invalid phone number',
          description: 'Phone number must be in E.164 format (e.g., +1234567890)',
          variant: 'destructive',
        })
        return
      }

      // Check if agent exists
      const selectedAgent = agents.find(a => a.id === data.agent_id)
      if (!selectedAgent) {
        toast({
          title: 'Agent not found',
          description: 'The selected agent could not be found.',
          variant: 'destructive',
        })
        return
      }

      // Warn if agent doesn't have ultravox_agent_id, but allow creation
      if (!selectedAgent.ultravox_agent_id) {
        toast({
          title: 'Warning',
          description: 'This agent is not yet configured with Ultravox. The call will be created but may not be processed.',
          variant: 'default',
        })
      }

      const result = await createCallMutation.mutateAsync({
        ...data,
        call_settings: {},
        context: {},
      })
      
      toast({
        title: 'Call initiated',
        description: 'The call has been queued and will start shortly.',
      })
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Error creating call:', error)
      let errorMessage = error instanceof Error ? error.message : 'Failed to create call. Please try again.'
      
      // Provide helpful error messages
      if (errorMessage.includes('Invalid or expired token')) {
        errorMessage = 'Your session has expired. Please refresh the page or log out and log back in.'
      } else if (errorMessage.includes('ultravox_agent_id')) {
        errorMessage = 'This agent is not configured with Ultravox. Please sync the agent with Ultravox first from the Agents page.'
      }
      
      toast({
        title: 'Error creating call',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Calls</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              View and manage all your voice calls
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Call
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {CALL_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading calls...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Calls Table - Desktop */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 dark:border-gray-900 bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Phone</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Agent</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Direction</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Status</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Duration</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Cost</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900 dark:text-white hidden lg:table-cell">Time</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-900">
                      {filteredCalls.map((call) => (
                        <tr 
                          key={call.id} 
                          className="hover:bg-primary/5 cursor-pointer transition-colors"
                          onClick={() => handleCallClick(call)}
                        >
                          <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-900 dark:text-white">
                            {formatPhoneNumber(call.phone_number)}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-900 dark:text-white">
                            {getAgentName(call.agent_id)}
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <Badge variant="outline" className="capitalize">
                              {call.direction}
                            </Badge>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            {getStatusBadge(call.status)}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-900 dark:text-white">
                            {call.duration_seconds ? formatDuration(call.duration_seconds) : '-'}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-900 dark:text-white">
                            {call.cost_usd ? `$${call.cost_usd.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                            {formatDate(new Date(call.created_at), 'long')}
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex items-center gap-1">
                              {call.status === 'completed' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCallClick(call)
                                    }}
                                  >
                                    <Play className="h-3 w-3 lg:h-4 lg:w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Download className="h-3 w-3 lg:h-4 lg:w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Calls Cards - Mobile */}
            <div className="md:hidden space-y-3">
              {filteredCalls.map((call) => (
                <Card 
                  key={call.id} 
                  className="cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all"
                  onClick={() => handleCallClick(call)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{formatPhoneNumber(call.phone_number)}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{getAgentName(call.agent_id)}</p>
                        </div>
                        {getStatusBadge(call.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Direction: </span>
                          <span className="text-gray-900 dark:text-white font-medium capitalize">{call.direction}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Duration: </span>
                          <span className="text-gray-900 dark:text-white font-medium">{call.duration_seconds ? formatDuration(call.duration_seconds) : '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Cost: </span>
                          <span className="text-gray-900 dark:text-white font-medium">{call.cost_usd ? `$${call.cost_usd.toFixed(2)}` : '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Time: </span>
                          <span className="text-gray-900 dark:text-white font-medium">{formatDate(new Date(call.created_at))}</span>
                        </div>
                      </div>
                      {call.status === 'completed' && (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-900">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 hover:bg-primary/5 hover:border-primary/40 transition-all"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCallClick(call)
                            }}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Play
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 hover:bg-primary/5 hover:border-primary/40 transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {!isLoading && filteredCalls.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
              <Phone className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">No calls yet</h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center px-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first call to get started'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 bg-primary hover:bg-primary/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Call
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Call Details Panel */}
        <CallDetailsPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          call={selectedCall}
        />

        {/* Create Call Modal */}
        <CreateCallModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateCall={handleCreateCall}
          agents={agents.filter(a => a.status === 'active')}
          isLoading={createCallMutation.isPending}
        />
      </div>
    </AppLayout>
  )
}

