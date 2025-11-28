'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Bot, Headphones, Wind, Check, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app-store'
import { useAgentStore } from '@/stores/agent-store'
import { useCreateAgent } from '@/hooks/use-agents'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useVoices } from '@/hooks/use-voices'
import { CreateAgentData } from '@/types'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

interface NewAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectType?: (type: 'blank' | 'personal' | 'business') => void
}

export function NewAgentModal({ isOpen, onClose, onSelectType }: NewAgentModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<'select' | 'voice' | 'complete'>('select')
  const [selectedTemplate, setSelectedTemplate] = useState<'blank' | 'personal' | 'business' | null>(null)
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('')
  const [agentName, setAgentName] = useState('')
  const [chatOnly, setChatOnly] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const isCreatingRef = useRef(false) // Use ref to prevent race conditions
  const { sidebarCollapsed, setModalOpen } = useAppStore()
  const { setSelectedAgent } = useAgentStore()
  const createAgentMutation = useCreateAgent()
  const { data: voices = [], isLoading: voicesLoading } = useVoices()
  const { data: session, status: sessionStatus } = useSession()

  // Sync modal open state with app store
  useEffect(() => {
    setModalOpen(isOpen)
    return () => {
      // Reset when component unmounts
      setModalOpen(false)
    }
  }, [isOpen, setModalOpen])

  const handleClose = () => {
    // Reset state when closing
    setStep('select')
    setSelectedTemplate(null)
    setSelectedVoiceId('')
    setAgentName('')
    setChatOnly(false)
    isCreatingRef.current = false
    setIsCreating(false)
    setModalOpen(false)
    onClose()
  }

  const handleBack = () => {
    if (step === 'complete') {
      setStep('voice')
    } else if (step === 'voice') {
    setStep('select')
  }
  }

  const handleTemplateSelect = (template: 'blank' | 'personal' | 'business') => {
    setSelectedTemplate(template)
    // Check if voices are available
    const activeVoices = voices.filter(v => v.status === 'active')
    if (activeVoices.length === 0) {
      toast({
        title: 'No active voices',
        description: 'Please create and activate a voice first.',
        variant: 'destructive',
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.push('/voice-cloning')
              handleClose()
            }}
          >
            Create Voice
          </Button>
        ),
      })
      return
    }
    // Auto-select first voice, but allow user to change it
    if (activeVoices.length > 0 && !selectedVoiceId) {
      setSelectedVoiceId(activeVoices[0].id)
    }
    setStep('voice')
  }

  const handleCreateAgent = async () => {
    // Prevent double submission
    if (isCreatingRef.current || isCreating) {
      console.log('Agent creation already in progress, ignoring duplicate call')
      return
    }
    
    if (!selectedTemplate || !agentName.trim()) {
      return
    }
    
    // Set both state and ref to prevent race conditions
    isCreatingRef.current = true
    setIsCreating(true)
    
    try {
      // Check authentication
      if (sessionStatus !== 'authenticated' || !session) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to create an agent.',
          variant: 'destructive',
        })
        isCreatingRef.current = false
        setIsCreating(false)
        return
      }
      
      // Wait for voices to load if still loading
      if (voicesLoading) {
        toast({
          title: 'Loading voices',
          description: 'Please wait while we check available voices...',
        })
        isCreatingRef.current = false
        setIsCreating(false)
        return
      }
      
      // Validate voice selection
      if (!selectedVoiceId) {
        toast({
          title: 'Voice required',
          description: 'Please select a voice for the agent.',
          variant: 'destructive',
        })
        isCreatingRef.current = false
        setIsCreating(false)
        return
      }

      const selectedVoice = voices.find(v => v.id === selectedVoiceId && v.status === 'active')
      if (!selectedVoice) {
        toast({
          title: 'Invalid voice',
          description: 'The selected voice is not available. Please select another voice.',
          variant: 'destructive',
        })
        isCreatingRef.current = false
        setIsCreating(false)
        return
      }
      
      // Create default system prompts based on template
      const systemPrompts = {
        blank: 'You are a helpful AI assistant.',
        personal: 'You are a friendly personal assistant. Help users manage their tasks, answer questions, and provide support in a warm and approachable manner.',
        business: 'You are a professional business assistant. Help users with business inquiries, provide information about products and services, and assist with customer support in a professional and efficient manner.',
      }
      
      // Create agent data
      const agentData: CreateAgentData = {
        name: agentName,
        description: `AI agent created from ${selectedTemplate} template`,
        voice_id: selectedVoiceId,
        system_prompt: systemPrompts[selectedTemplate],
        model: 'fixie-ai/ultravox-v0_4-8k', // Default model
        tools: [],
        knowledge_bases: [],
      }
      
      // Create agent via API
      // Note: The ref guard (isCreatingRef) prevents duplicate submissions
      // The backend also uses idempotency keys to prevent duplicates
      const newAgent = await createAgentMutation.mutateAsync(agentData)
      
      // Set selected agent and navigate
      setSelectedAgent(newAgent)
      
      toast({
        title: 'Agent created',
        description: `"${agentName}" has been created successfully.`,
      })
      
      // Call the onSelectType callback if provided
      if (onSelectType) {
        onSelectType(selectedTemplate)
      }
      
      // Navigate to agent editor
      router.push('/agents/new')
    
      // Reset state and close
      setStep('select')
      setSelectedTemplate(null)
      setAgentName('')
      setChatOnly(false)
      setModalOpen(false)
      onClose()
    } catch (error) {
      toast({
        title: 'Error creating agent',
        description: error instanceof Error ? error.message : 'Failed to create agent. Please try again.',
        variant: 'destructive',
      })
    } finally {
      isCreatingRef.current = false
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  // Step 2: Select Voice
  if (step === 'voice') {
    const activeVoices = voices.filter(v => v.status === 'active')
    
    return (
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-white dark:bg-black flex flex-col transition-all duration-300",
          "w-full h-full overflow-hidden",
          'left-0'
        )}
      >
        {/* Simple Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-900">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Select a voice
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Scrollable Voice List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {voicesLoading ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">Loading voices...</p>
              </div>
            ) : activeVoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  No active voices available
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push('/voice-cloning')
                    handleClose()
                  }}
                >
                  Create Voice
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-w-2xl mx-auto">
                {activeVoices.map(voice => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoiceId(voice.id)}
                    className={cn(
                      "w-full p-4 border-2 rounded-lg text-left transition-all",
                      "hover:shadow-sm active:scale-[0.99]",
                      selectedVoiceId === voice.id
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                          {voice.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {voice.provider} • {voice.type}
                        </div>
                      </div>
                      {selectedVoiceId === voice.id && (
                        <div className="ml-4 flex-shrink-0">
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Simple Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-900 p-4 sm:p-5 bg-white dark:bg-black">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => setStep('complete')}
              disabled={!selectedVoiceId || activeVoices.length === 0}
              className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed px-6"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Complete Agent
  if (step === 'complete') {
    return (
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-white dark:bg-black flex flex-col transition-all duration-300",
          'left-0'
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 sm:p-5">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 flex items-center justify-center">
          <div className="w-full max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Complete your agent
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Choose a name that reflects your agent&apos;s purpose
            </p>

            {/* Agent Name Input */}
            <div className="space-y-2 mb-5">
              <label htmlFor="agentName" className="block text-sm font-medium text-gray-900 dark:text-white">
                Agent Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="agentName"
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value.slice(0, 50))}
                  placeholder="Enter agent name"
                  className="pr-16 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  maxLength={50}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
                  {agentName.length}/50
                </span>
              </div>
            </div>

            {/* Chat Only Toggle */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="chatOnly"
                  className="relative inline-flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id="chatOnly"
                    checked={chatOnly}
                    onChange={(e) => setChatOnly(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Chat only</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Audio will not be processed and only text will be used
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center space-x-2 mt-8">
              <button
                onClick={() => setStep('select')}
                className="h-2 w-2 rounded-full bg-primary transition-all duration-200"
              />
              <button
                onClick={() => setStep('voice')}
                className="h-2 w-2 rounded-full bg-primary transition-all duration-200"
              />
              <div className="h-2 w-6 rounded-full bg-primary transition-all duration-200" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-900 p-4 sm:p-5 bg-white dark:bg-black">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleCreateAgent()
              }}
              disabled={!agentName.trim() || isCreating || isCreatingRef.current}
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed px-8"
              type="button"
            >
              {isCreating ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Step 1: Select Template

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-white dark:bg-black flex flex-col transition-all duration-300",
        'left-0'
      )}
    >
      {/* Header - Only Close Icon */}
      <div className="flex-shrink-0 flex items-center justify-end p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-all"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 flex items-center justify-center bg-gray-50/30 dark:bg-gray-950/30">
        <div className="w-full max-w-3xl mx-auto pt-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">New agent</h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">What type of agent would you like to create?</p>
          </div>
          {/* Blank Agent - Full width on top */}
          <div className="mb-4">
            <button
              onClick={() => handleTemplateSelect('blank')}
              className={cn(
                "relative flex items-center justify-center gap-3 p-3 sm:p-3.5 border-2 rounded-xl transition-all duration-300 w-full bg-white dark:bg-gray-900",
                selectedTemplate === 'blank' 
                  ? "border-primary shadow-xl shadow-primary/20 scale-[1.02]" 
                  : "border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:shadow-lg hover:scale-[1.01] bg-white dark:bg-gray-900"
              )}
            >
              {selectedTemplate === 'blank' && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-md animate-in zoom-in-50 duration-200">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-sm">
                <Bot className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Blank Agent</h3>
            </button>
          </div>

          {/* Personal Assistant and Business Agent - Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Personal Assistant */}
            <button
              onClick={() => handleTemplateSelect('personal')}
              className={cn(
                "relative flex flex-col items-start p-5 sm:p-6 border-2 rounded-xl transition-all duration-300 text-left w-full bg-white dark:bg-gray-900",
                selectedTemplate === 'personal' 
                  ? "border-primary shadow-xl shadow-primary/20 scale-[1.02]" 
                  : "border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:shadow-lg hover:scale-[1.01]"
              )}
            >
              {selectedTemplate === 'personal' && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-md animate-in zoom-in-50 duration-200">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 shadow-sm">
                  <Headphones className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Personal Assistant</h3>
              </div>
              <div className="space-y-2.5 w-full">
                <div className="bg-gradient-to-br from-primary to-primary/90 text-white p-3 rounded-2xl rounded-br-sm text-xs leading-relaxed max-w-[88%] shadow-sm">
                  Could you see whether I have any urgent outstanding emails?
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 p-3 rounded-2xl rounded-bl-sm text-xs ml-auto max-w-[88%] shadow-sm">
                  Sure, let me check. You&apos;ve got one urgent email from your manager about tomorrow&apos;s meeting. Want a quick summary?
                </div>
              </div>
            </button>

            {/* Business Agent */}
            <button
              onClick={() => handleTemplateSelect('business')}
              className={cn(
                "relative flex flex-col items-start p-5 sm:p-6 border-2 rounded-xl transition-all duration-300 text-left w-full bg-white dark:bg-gray-900",
                selectedTemplate === 'business' 
                  ? "border-primary shadow-xl shadow-primary/20 scale-[1.02]" 
                  : "border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:shadow-lg hover:scale-[1.01]"
              )}
            >
              {selectedTemplate === 'business' && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-md animate-in zoom-in-50 duration-200">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-sm">
                  <Wind className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Business Agent</h3>
              </div>
              <div className="space-y-2.5 w-full">
                <div className="bg-gradient-to-br from-primary to-primary/90 text-white p-3 rounded-2xl rounded-br-sm text-xs leading-relaxed max-w-[88%] shadow-sm">
                  Can you tell me more about pricing?
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 p-3 rounded-2xl rounded-bl-sm text-xs ml-auto max-w-[88%] shadow-sm">
                  Absolutely! We offer three plans, Starter, Pro, and Enterprise. Want a quick breakdown, or should I help you pick the best fit?
                </div>
              </div>
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center items-center space-x-2 mt-8">
            {['blank', 'personal', 'business'].map((templateId, index) => (
              <button
                key={templateId}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  selectedTemplate === templateId 
                    ? "bg-primary w-8 shadow-md shadow-primary/30" 
                    : "bg-gray-300 dark:bg-gray-700 w-2 hover:bg-gray-400 dark:hover:bg-gray-600"
                )}
                onClick={() => setSelectedTemplate(templateId as 'blank' | 'personal' | 'business')}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
