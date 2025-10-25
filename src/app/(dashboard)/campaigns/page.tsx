'use client'

import { useState, useTransition } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreVertical, Play, Pause, Eye, Trash, Loader2, PhoneOutgoing } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CAMPAIGN_STATUSES } from '@/constants'
import { formatDate } from '@/lib/utils'

// Mock data
const mockCampaigns: any[] = []

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleNavigateToNew = () => {
    setIsNavigating(true)
    startTransition(() => {
      router.push('/campaigns/new')
      setTimeout(() => setIsNavigating(false), 300)
    })
  }

  const filteredCampaigns = mockCampaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const statusConfig = CAMPAIGN_STATUSES.find(s => s.value === status)
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary'
    
    if (status === 'running') variant = 'default'
    if (status === 'cancelled') variant = 'destructive'

    return (
      <Badge variant={variant} className="capitalize">
        {statusConfig?.label || status}
      </Badge>
    )
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Fixed Header Section */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-black/95 backdrop-blur border-b border-gray-200 dark:border-gray-900 pb-4 sm:pb-6 mb-4 sm:mb-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Batch Calling</h1>
              <Button 
                onClick={handleNavigateToNew}
                disabled={isNavigating}
                className="w-full sm:w-auto bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
              >
                Create a batch call
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Search Batch Calls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">

        {/* Campaigns List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredCampaigns.map((campaign) => {
            const progress = (campaign.completed / campaign.totalContacts) * 100
            const successRate = campaign.completed > 0 
              ? (campaign.successful / campaign.completed) * 100 
              : 0

            return (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white">{campaign.name}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{campaign.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {getStatusBadge(campaign.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-900">
                          <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {campaign.status === 'running' ? (
                            <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                              <Play className="mr-2 h-4 w-4" />
                              Start
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-900">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Agent</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{campaign.agent}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Progress</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        {campaign.completed} / {campaign.totalContacts}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{successRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Created</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{formatDate(campaign.createdAt)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Campaign Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

          {filteredCampaigns.length === 0 && (
            <Card className="border-gray-200 dark:border-gray-900">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 mb-4">
                  <PhoneOutgoing className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No batch calls found
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  You have not created any batch calls yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

