'use client'

import { useState, useEffect } from 'react'
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
  User,
  Loader2
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { Call, useCall, useCallTranscript, useCallRecording } from '@/hooks/use-calls'
import { useAgents } from '@/hooks/use-agents'
import { formatDate, formatDuration, formatPhoneNumber } from '@/lib/utils'
import { CALL_STATUSES } from '@/constants'

interface CallDetailsPanelProps {
  isOpen: boolean
  onClose: () => void
  call: Call | null
}

export function CallDetailsPanel({ isOpen, onClose, call }: CallDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x')
  const [mounted, setMounted] = useState(false)
  
  // Fetch call details with refresh for active calls
  const { data: callData, isLoading: callLoading } = useCall(
    call?.id || '', 
    call?.status && ['queued', 'ringing', 'in_progress'].includes(call.status)
  )
  const { data: transcriptData, isLoading: transcriptLoading } = useCallTranscript(call?.id || '')
  const { data: recordingData, isLoading: recordingLoading } = useCallRecording(call?.id || '')
  const { data: agents = [] } = useAgents()
  
  const currentCall = callData || call
  const agent = agents.find(a => a.id === currentCall?.agent_id)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!currentCall || !mounted) return null

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

  const panelContent = (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 z-[200] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Right-side Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[600px] lg:w-[700px] max-w-[95vw] bg-white dark:bg-black shadow-2xl z-[201] transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-900 flex-shrink-0">
            <div className="min-w-0 flex-1 pr-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                Call with {agent?.name || 'Unknown Agent'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1 truncate">
                {formatPhoneNumber(currentCall.phone_number)} • {currentCall.direction}
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

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Audio Player */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-900">
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
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      0:00 / {currentCall.duration_seconds ? formatDuration(currentCall.duration_seconds) : '--:--'}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Message */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-900">
              <div className="flex items-start space-x-3 p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  You can now ensure your agent returns high quality responses to conversations like this one. Try Tests in the Transcription tab.
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-900">
              <div className="flex space-x-6 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'transcription', label: 'Transcription' },
                  { id: 'client-data', label: 'Client data' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {activeTab === 'overview' && (
                <>
                  {/* Summary */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Summary</h3>
                    {transcriptData?.summary ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transcriptData.summary}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {currentCall.status === 'completed' 
                          ? 'Summary will be available after call processing.'
                          : 'Summary will be available after the call completes.'}
                      </p>
                    )}
                  </div>

                  {/* Call Status */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Call Status</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(currentCall.status)}
                    </div>
                  </div>

                  {/* Agent */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Agent</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{agent?.name || 'Unknown'}</p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Phone Number</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatPhoneNumber(currentCall.phone_number)}</p>
                  </div>

                  {/* Direction */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Direction</h3>
                    <Badge variant="outline" className="capitalize">
                      {currentCall.direction}
                    </Badge>
                  </div>
                </>
              )}

              {activeTab === 'transcription' && (
                <div>
                  {transcriptLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : transcriptData?.transcript && transcriptData.transcript.length > 0 ? (
                    <div className="space-y-4">
                      {transcriptData.transcript.map((entry: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-900 dark:text-white capitalize">
                              {entry.speaker || 'unknown'}
                            </span>
                            {entry.timestamp && (
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {formatDuration(Math.floor(entry.timestamp))}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{entry.text}</p>
                          {entry.confidence !== undefined && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Confidence: {(entry.confidence * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentCall.status === 'completed' 
                        ? 'Transcript will be available after call processing.'
                        : 'Transcript will be available after the call completes.'}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'client-data' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Context Data</h3>
                  {currentCall.context && Object.keys(currentCall.context).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(currentCall.context).map(([key, value]) => (
                        <div key={key} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">{key}:</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No context data available.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Metadata Panel - Fixed at Bottom */}
          <div className="border-t border-gray-200 dark:border-gray-900 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                </div>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatDate(new Date(currentCall.created_at), 'long')}
                </span>
              </div>
              
              {currentCall.started_at && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Started:</span>
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatDate(new Date(currentCall.started_at))}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                </div>
                <span className="text-gray-900 dark:text-white font-medium">
                  {currentCall.duration_seconds ? formatDuration(currentCall.duration_seconds) : '-'}
                </span>
              </div>
              
              {currentCall.cost_usd !== undefined && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    ${currentCall.cost_usd.toFixed(2)}
                  </span>
                </div>
              )}
              
              {recordingData?.recording_url && (
                <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-2">
                    <Play className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Recording:</span>
                  </div>
                  <a
                    href={recordingData.recording_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return mounted ? createPortal(panelContent, document.body) : null
}
