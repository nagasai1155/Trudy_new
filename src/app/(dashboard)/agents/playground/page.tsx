'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Headphones, Wind, TrendingUp, Wand2, Check, Mic2, Search } from 'lucide-react'

const agentTemplates = [
  {
    id: 'support',
    name: 'Support agent',
    description: 'Talk to Alexis, a dedicated support agent who is always ready to resolve any issues.',
    avatar: '👩',
    agentName: 'Alexis',
    icon: Headphones,
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      tertiary: '#fde68a',
      quaternary: '#fcd34d',
      gradient: 'radial-gradient(circle at 50% 50%, #fef08a, #34d399, #10b981, #065f46)',
    }
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness coach',
    description: 'Speak with Joe, a mindfulness coach who helps you find calm and clarity.',
    avatar: '🧘',
    agentName: 'Joe',
    icon: Wind,
    colors: {
      primary: '#06b6d4',
      secondary: '#22d3ee',
      tertiary: '#3b82f6',
      quaternary: '#60a5fa',
      gradient: 'radial-gradient(circle at 50% 50%, #7dd3fc, #22d3ee, #06b6d4, #0e7490)',
    }
  },
  {
    id: 'sales',
    name: 'Sales agent',
    description: 'Talk to Harper, a sales agent who showcases how ElevenLabs can transform your business.',
    avatar: '💼',
    agentName: 'Harper',
    icon: TrendingUp,
    colors: {
      primary: '#a855f7',
      secondary: '#c084fc',
      tertiary: '#06b6d4',
      quaternary: '#22d3ee',
      gradient: 'radial-gradient(circle at 50% 50%, #7dd3fc, #c084fc, #a855f7, #6b21a8)',
    }
  },
  {
    id: 'videogame',
    name: 'Video game character',
    description: 'Speak with a mysterious wizard who offers ancient wisdom to aid you on your journey.',
    avatar: '🧙',
    agentName: 'Callum',
    icon: Wand2,
    colors: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      tertiary: '#eab308',
      quaternary: '#facc15',
      gradient: 'radial-gradient(circle at 50% 50%, #fef3c7, #fcd34d, #f59e0b, #92400e)',
    }
  },
]

export default function PlaygroundPage() {
  const router = useRouter()
  const [selectedAgent, setSelectedAgent] = useState('support')
  const [searchQuery, setSearchQuery] = useState('')

  const currentAgent = agentTemplates.find(agent => agent.id === selectedAgent) || agentTemplates[0]

  // Filter agents based on search query
  const filteredAgents = agentTemplates.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.agentName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AppLayout>
      <div className="bg-white dark:bg-black h-screen xl:h-[calc(100vh-72px)] flex flex-col xl:-mt-[72px] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-900 px-6 py-4 flex-shrink-0">
          <button
            onClick={() => router.push('/agents')}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to agents
          </button>
          
          {/* Search Field */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full max-w-xs border-gray-300 dark:border-gray-800 rounded-lg"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Sidebar - Agent List */}
          <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-900 p-6 overflow-y-auto">
            {filteredAgents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500 dark:text-gray-500">No agents found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAgents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`relative w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAgent === agent.id
                        ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                  >
                    {selectedAgent === agent.id && (
                      <div className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-black dark:bg-white">
                        <Check className="h-3 w-3 text-white dark:text-black" strokeWidth={3} />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-2">
                      <agent.icon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {agent.name}
                      </h3>
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                      {agent.description}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-base">{agent.avatar}</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                        {agent.agentName}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Visualization */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden">
            {/* Circular Gradient Visualization */}
            <div className="relative flex items-center justify-center">
              <div 
                className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 overflow-hidden"
                style={{
                  aspectRatio: '1/1',
                }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    background: currentAgent.colors.gradient,
                    animation: 'spin 8s linear infinite',
                  }}
                />
              </div>
              
              {/* Try a call button */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <Button
                  className="bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-black dark:text-white border-2 border-gray-200 dark:border-gray-800 shadow-xl gap-2 px-4 py-2 text-sm"
                  onClick={() => {
                    // Handle try call
                  }}
                >
                  <Mic2 className="h-4 w-4" />
                  Try a call
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-900 px-6 py-4 bg-white dark:bg-black flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white"
              onClick={() => router.push('/agents/new')}
            >
              Start from blank
            </Button>
            <Button
              className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
              onClick={() => router.push('/agents/new')}
            >
              Create agent
            </Button>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </AppLayout>
  )
}

