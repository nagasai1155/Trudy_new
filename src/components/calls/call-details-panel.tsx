'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  MoreHorizontal,
  Info,
  Clock,
  CreditCard,
  User
} from 'lucide-react'

interface CallDetails {
  id: string
  contact: string
  phoneNumber: string
  agent: string
  status: string
  duration: number
  cost: number
  timestamp: Date
  conversationId?: string
}

interface CallDetailsPanelProps {
  isOpen: boolean
  onClose: () => void
  call: CallDetails | null
}

export function CallDetailsPanel({ isOpen, onClose, call }: CallDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x')

  if (!call) return null

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusBadge = (status: string) => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary'
    
    if (status === 'completed') variant = 'default'
    if (status === 'failed') variant = 'destructive'

    return (
      <Badge variant={variant} className="capitalize">
        {status}
      </Badge>
    )
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/60 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sliding Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-full sm:max-w-2xl bg-white dark:bg-black shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-900 flex-shrink-0">
            <div className="min-w-0 flex-1 pr-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                Conversation with {call.agent}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1 truncate">
                {call.conversationId || 'LVFQEd8kGl5boXeJWFEw'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-900 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Audio Player */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-900 flex-shrink-0">
            <div className="space-y-4">
              {/* Waveform Visualization */}
              <div className="h-12 sm:h-16 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary/40 rounded-full"
                      style={{
                        height: `${Math.random() * 40 + 10}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Audio Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-10 w-10 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{playbackSpeed}</span>
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">0:00 / {formatDuration(call.duration)}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Information Message */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-900 flex-shrink-0">
            <div className="flex items-start space-x-3 p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                You can now ensure your agent returns high quality responses to conversations like this one. Try Tests in the Transcription tab.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-900 flex-shrink-0 overflow-x-auto">
            <div className="flex space-x-6 sm:space-x-8 px-4 sm:px-6 min-w-max">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'transcription', label: 'Transcription' },
                { id: 'client-data', label: 'Client data' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-primary hover:border-primary/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Summary</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Summary couldn&apos;t be generated for this call.
                  </p>
                </div>

                {/* Call Status */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Call status</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(call.status)}
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {call.status === 'completed' ? 'Unknown' : call.status}
                    </span>
                  </div>
                </div>

                {/* User ID */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">User ID</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">No user ID</p>
                </div>
              </div>
            )}

            {activeTab === 'transcription' && (
              <div className="p-4 sm:p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Transcription content would go here...</p>
              </div>
            )}

            {activeTab === 'client-data' && (
              <div className="p-4 sm:p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Client data would go here...</p>
              </div>
            )}
          </div>

          {/* Metadata Panel */}
          <div className="border-t border-gray-200 dark:border-gray-900 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                </div>
                <span className="text-gray-900 dark:text-white font-medium">{formatDate(call.timestamp)}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Connection duration:</span>
                </div>
                <span className="text-gray-900 dark:text-white font-medium">{formatDuration(call.duration)}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Credits (call):</span>
                </div>
                <span className="text-gray-900 dark:text-white font-medium">{Math.round(call.cost * 100)}</span>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
