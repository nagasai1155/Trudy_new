'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CallDetailsPanel } from '@/components/calls/call-details-panel'
import { Search, Play, Download } from 'lucide-react'
import { useState } from 'react'
import { CALL_STATUSES } from '@/constants'
import { formatDate, formatDuration, formatPhoneNumber } from '@/lib/utils'

// Mock data
const mockCalls = [
  {
    id: '1',
    contact: 'John Doe',
    phoneNumber: '+1234567890',
    agent: 'Sales Agent',
    status: 'completed' as const,
    duration: 225,
    cost: 0.45,
    timestamp: new Date('2024-02-15T10:30:00'),
  },
  {
    id: '2',
    contact: 'Jane Smith',
    phoneNumber: '+1234567891',
    agent: 'Support Agent',
    status: 'completed' as const,
    duration: 180,
    cost: 0.36,
    timestamp: new Date('2024-02-15T11:15:00'),
  },
  {
    id: '3',
    contact: 'Bob Johnson',
    phoneNumber: '+1234567892',
    agent: 'Sales Agent',
    status: 'failed' as const,
    duration: 45,
    cost: 0.09,
    timestamp: new Date('2024-02-15T12:00:00'),
  },
  {
    id: '4',
    contact: 'Alice Brown',
    phoneNumber: '+1234567893',
    agent: 'Survey Agent',
    status: 'voicemail' as const,
    duration: 90,
    cost: 0.18,
    timestamp: new Date('2024-02-15T13:30:00'),
  },
  {
    id: '5',
    contact: 'Charlie Wilson',
    phoneNumber: '+1234567894',
    agent: 'Sales Agent',
    status: 'no_answer' as const,
    duration: 30,
    cost: 0.06,
    timestamp: new Date('2024-02-15T14:00:00'),
  },
]

export default function CallsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCall, setSelectedCall] = useState<any>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const filteredCalls = mockCalls.filter(call => {
    const matchesSearch = 
      call.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.phoneNumber.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = CALL_STATUSES.find(s => s.value === status)
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary'
    
    if (status === 'completed') variant = 'default'
    if (status === 'failed') variant = 'destructive'

    return (
      <Badge variant={variant} className="capitalize">
        {statusConfig?.label || status}
      </Badge>
    )
  }

  const handleCallClick = (call: any) => {
    setSelectedCall(call)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setSelectedCall(null)
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Calls</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            View and manage all your voice calls
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
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

        {/* Calls Table - Desktop */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-900 bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Contact</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Phone</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900 dark:text-white">Agent</th>
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
                      className="hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                      onClick={() => handleCallClick(call)}
                    >
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">{call.contact}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                        {formatPhoneNumber(call.phoneNumber)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-900 dark:text-white">
                        {call.agent}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        {getStatusBadge(call.status)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-900 dark:text-white">
                        {formatDuration(call.duration)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-900 dark:text-white">
                        ${call.cost.toFixed(2)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                        {formatDate(call.timestamp, 'long')}
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
              className="cursor-pointer"
              onClick={() => handleCallClick(call)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{call.contact}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{formatPhoneNumber(call.phoneNumber)}</p>
                    </div>
                    {getStatusBadge(call.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Agent: </span>
                      <span className="text-gray-900 dark:text-white font-medium">{call.agent}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Duration: </span>
                      <span className="text-gray-900 dark:text-white font-medium">{formatDuration(call.duration)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Cost: </span>
                      <span className="text-gray-900 dark:text-white font-medium">${call.cost.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Time: </span>
                      <span className="text-gray-900 dark:text-white font-medium">{formatDate(call.timestamp)}</span>
                    </div>
                  </div>
                  {call.status === 'completed' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-900">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
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
                        className="flex-1"
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

        {filteredCalls.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">No calls found</h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center px-4">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}

        {/* Call Details Panel */}
        <CallDetailsPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          call={selectedCall}
        />
      </div>
    </AppLayout>
  )
}

