'use client'

import { useState } from 'react'
import { X, Bot, Headphones, Wind, Check, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app-store'
import { useAgentStore } from '@/stores/agent-store'

interface NewAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectType?: (type: 'blank' | 'personal' | 'business') => void
}

export function NewAgentModal({ isOpen, onClose, onSelectType }: NewAgentModalProps) {
  const [step, setStep] = useState<'select' | 'complete'>('select')
  const [selectedTemplate, setSelectedTemplate] = useState<'blank' | 'personal' | 'business' | null>(null)
  const [agentName, setAgentName] = useState('')
  const [chatOnly, setChatOnly] = useState(false)
  const { sidebarCollapsed } = useAppStore()
  const { addAgent } = useAgentStore()

  const handleClose = () => {
    // Reset state when closing
    setStep('select')
    setSelectedTemplate(null)
    setAgentName('')
    setChatOnly(false)
    onClose()
  }

  const handleBack = () => {
    setStep('select')
  }

  const handleContinue = () => {
    if (selectedTemplate) {
      setStep('complete')
    }
  }

  const handleCreateAgent = () => {
    if (selectedTemplate && agentName.trim()) {
      // Add agent to store
      addAgent({
        name: agentName,
        type: selectedTemplate,
        chatOnly: chatOnly,
      })
      
      // Call the onSelectType callback if provided (for navigation)
      if (onSelectType) {
        onSelectType(selectedTemplate)
      }
      
      // Reset state and close
      setStep('select')
      setSelectedTemplate(null)
      setAgentName('')
      setChatOnly(false)
      onClose()
    }
  }

  if (!isOpen) return null

  // Step 2: Complete Agent
  if (step === 'complete') {
    return (
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-white dark:bg-black flex flex-col transition-all duration-300",
          sidebarCollapsed ? 'xl:left-20' : 'xl:left-72',
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
                className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700 transition-all duration-200"
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
              onClick={handleCreateAgent}
              disabled={!agentName.trim()}
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed px-8"
            >
              Create Agent
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
        // Adjust left position based on sidebar state on desktop
        sidebarCollapsed ? 'xl:left-20' : 'xl:left-72',
        // Full width on mobile/tablet
        'left-0'
      )}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-5 lg:p-6">
        <div className="flex-1 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">New agent</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5">What type of agent would you like to create?</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto">
          {/* Blank Agent - Full width on top */}
          <div className="mb-3">
            <button
              onClick={() => setSelectedTemplate('blank')}
              className={cn(
                "relative flex items-center justify-center gap-2.5 p-3 border-2 rounded-lg transition-all duration-200 w-full",
                selectedTemplate === 'blank' 
                  ? "border-primary shadow-lg shadow-primary/20" 
                  : "border-gray-200 dark:border-gray-800 hover:border-primary/40 hover:shadow-md"
              )}
            >
              {selectedTemplate === 'blank' && (
                <div className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </div>
              )}
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
                <Bot className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Blank Agent</h3>
            </button>
          </div>

          {/* Personal Assistant and Business Agent - Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {/* Personal Assistant */}
            <button
              onClick={() => setSelectedTemplate('personal')}
              className={cn(
                "relative flex flex-col items-start p-3 border-2 rounded-lg transition-all duration-200 text-left w-full",
                selectedTemplate === 'personal' 
                  ? "border-primary shadow-lg shadow-primary/20" 
                  : "border-gray-200 dark:border-gray-800 hover:border-primary/40 hover:shadow-md"
              )}
            >
              {selectedTemplate === 'personal' && (
                <div className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </div>
              )}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                  <Headphones className="h-4 w-4 text-primary dark:text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Personal Assistant</h3>
              </div>
              <div className="space-y-2 w-full">
                <div className="bg-primary text-white p-2.5 rounded-2xl rounded-br-sm text-xs max-w-[85%]">
                  Could you see whether I have any urgent outstanding emails?
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 p-2.5 rounded-2xl rounded-bl-sm text-xs ml-auto max-w-[85%]">
                  Sure, let me check. You&apos;ve got one urgent email from your manager about tomorrow&apos;s meeting. Want a quick summary?
                </div>
              </div>
            </button>

            {/* Business Agent */}
            <button
              onClick={() => setSelectedTemplate('business')}
              className={cn(
                "relative flex flex-col items-start p-3 border-2 rounded-lg transition-all duration-200 text-left w-full",
                selectedTemplate === 'business' 
                  ? "border-primary shadow-lg shadow-primary/20" 
                  : "border-gray-200 dark:border-gray-800 hover:border-primary/40 hover:shadow-md"
              )}
            >
              {selectedTemplate === 'business' && (
                <div className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </div>
              )}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <Wind className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Business Agent</h3>
              </div>
              <div className="space-y-2 w-full">
                <div className="bg-primary text-white p-2.5 rounded-2xl rounded-br-sm text-xs max-w-[85%]">
                  Can you tell me more about pricing?
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 p-2.5 rounded-2xl rounded-bl-sm text-xs ml-auto max-w-[85%]">
                  Absolutely! We offer three plans, Starter, Pro, and Enterprise. Want a quick breakdown, or should I help you pick the best fit?
                </div>
              </div>
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {['blank', 'personal', 'business'].map((templateId, index) => (
              <button
                key={templateId}
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-200",
                  selectedTemplate === templateId ? "bg-primary w-6" : "bg-gray-300 dark:bg-gray-700"
                )}
                onClick={() => setSelectedTemplate(templateId as 'blank' | 'personal' | 'business')}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-900 p-4 sm:p-5 bg-white dark:bg-black">
        <div className="max-w-2xl mx-auto flex justify-end">
          <Button
            onClick={handleContinue}
            disabled={!selectedTemplate}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed px-8"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
