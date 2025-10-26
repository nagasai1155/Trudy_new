'use client'

import { useState } from 'react'
import { X, Bot, Headphones, Wind, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NewAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectType: (type: 'blank' | 'personal' | 'business') => void
}

export function NewAgentModal({ isOpen, onClose, onSelectType }: NewAgentModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<'blank' | 'personal' | 'business' | null>(null)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-900">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New agent</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">What type of agent would you like to create?</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Agent Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Blank Agent */}
            <button
              onClick={() => setSelectedTemplate('blank')}
              className={cn(
                "relative flex flex-col items-start p-5 border-2 rounded-lg transition-all duration-200 text-left",
                selectedTemplate === 'blank' 
                  ? "border-black dark:border-white shadow-lg" 
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md"
              )}
            >
              {selectedTemplate === 'blank' && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-black dark:bg-white">
                  <Check className="h-3 w-3 text-white dark:text-black" strokeWidth={3} />
                </div>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-900 mb-3">
                <Bot className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Blank Agent</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-left">Start from scratch with a completely empty agent.</p>
            </button>

            {/* Personal Assistant */}
            <button
              onClick={() => setSelectedTemplate('personal')}
              className={cn(
                "relative flex flex-col items-start p-5 border-2 rounded-lg transition-all duration-200 text-left",
                selectedTemplate === 'personal' 
                  ? "border-black dark:border-white shadow-lg" 
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md"
              )}
            >
              {selectedTemplate === 'personal' && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-black dark:bg-white">
                  <Check className="h-3 w-3 text-white dark:text-black" strokeWidth={3} />
                </div>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 mb-3">
                <Headphones className="h-5 w-5 text-primary dark:text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Personal Assistant</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-left mb-4">
                A helpful assistant that can manage your schedule, answer questions, and provide information.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg w-full">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Example conversation:</p>
                <div className="space-y-2">
                  <div className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary p-4 rounded-lg flex items-start space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary text-xs font-semibold">
                      You
                    </div>
                    <p className="text-sm">Could you see whether I have any urgent outstanding emails?</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-300 p-4 rounded-lg flex items-start space-x-3 ml-11">
                    <p className="text-sm">Sure, let me check. You&apos;ve got one urgent email from your manager about tomorrow&apos;s meeting. Want a quick summary?</p>
                  </div>
                </div>
              </div>
            </button>

            {/* Business Agent */}
            <button
              onClick={() => setSelectedTemplate('business')}
              className={cn(
                "relative flex flex-col items-start p-5 border-2 rounded-lg transition-all duration-200 text-left",
                selectedTemplate === 'business' 
                  ? "border-black dark:border-white shadow-lg" 
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md"
              )}
            >
              {selectedTemplate === 'business' && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-black dark:bg-white">
                  <Check className="h-3 w-3 text-white dark:text-black" strokeWidth={3} />
                </div>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950 mb-3">
                <Wind className="h-5 w-5 text-green-700 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Business Agent</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-left mb-4">
                An agent designed for customer support, sales, or other business interactions.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg w-full">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Example conversation:</p>
                <div className="space-y-2">
                  <div className="bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-300 p-4 rounded-lg flex items-start space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-semibold">
                      You
                    </div>
                    <p className="text-sm">Can you tell me more about pricing?</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-300 p-4 rounded-lg flex items-start space-x-3 ml-11">
                    <p className="text-sm">Absolutely! We offer three plans, Starter, Pro, and Enterprise. Want a quick breakdown, or should I help you pick the best fit?</p>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-2 mt-8">
            {['blank', 'personal', 'business'].map((templateId, index) => (
              <button
                key={templateId}
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-200",
                  selectedTemplate === templateId ? "bg-black dark:bg-white w-6" : "bg-gray-300 dark:bg-gray-700"
                )}
                onClick={() => setSelectedTemplate(templateId as 'blank' | 'personal' | 'business')}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-900 p-6">
        <div className="max-w-4xl mx-auto flex justify-end">
          <Button
            onClick={() => selectedTemplate && onSelectType(selectedTemplate)}
            disabled={!selectedTemplate}
            className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
