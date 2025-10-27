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
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Headphones, Wind, TrendingUp, Wand2, Check, Mic2, Search, Plus, MoreHorizontal, ChevronDown, ExternalLink, Copy, Archive, Trash2, Play } from 'lucide-react'

// Mock agents data with color schemes
const agents = [
  {
    id: 1,
    name: 'Support agent',
    description: 'Talk to Alexis, a dedicated support agent who is always ready to resolve any issues.',
    agentName: 'Alexis',
    avatar: '👩',
    icon: Headphones,
    createdBy: 'Naga Sai Balam',
    createdAt: 'Oct 23, 2025, 9:33 AM',
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      tertiary: '#fde68a',
      quaternary: '#fcd34d',
      glow1: 'from-green-200/30',
      glow2: 'to-amber-200/30',
    }
  },
  {
    id: 2,
    name: 'Mindfulness coach',
    description: 'Speak with Joe, a mindfulness coach who helps you find calm and clarity.',
    agentName: 'Joe',
    avatar: '🧘',
    icon: Wind,
    createdBy: 'Naga Sai Balam',
    createdAt: 'Oct 22, 2025, 3:15 PM',
    colors: {
      primary: '#06b6d4',
      secondary: '#22d3ee',
      tertiary: '#3b82f6',
      quaternary: '#60a5fa',
      glow1: 'from-cyan-200/30',
      glow2: 'to-blue-200/30',
    }
  },
  {
    id: 3,
    name: 'Sales agent',
    description: 'Talk to Harper, a sales agent who showcases how ElevenLabs can transform your business.',
    agentName: 'Harper',
    avatar: '💼',
    icon: TrendingUp,
    createdBy: 'Naga Sai Balam',
    createdAt: 'Oct 21, 2025, 11:20 AM',
    colors: {
      primary: '#06b6d4',
      secondary: '#22d3ee',
      tertiary: '#a855f7',
      quaternary: '#c084fc',
      glow1: 'from-cyan-200/30',
      glow2: 'to-purple-200/30',
    }
  },
  {
    id: 4,
    name: 'Video game character',
    description: 'Speak with a mysterious wizard who offers ancient wisdom to aid you on your journey.',
    agentName: 'Callum',
    avatar: '🧙',
    icon: Wand2,
    createdBy: 'Naga Sai Balam',
    createdAt: 'Oct 20, 2025, 2:45 PM',
    colors: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      tertiary: '#eab308',
      quaternary: '#facc15',
      glow1: 'from-amber-200/30',
      glow2: 'to-yellow-200/30',
    }
  },
]

export default function AgentsPage() {
  const router = useRouter()
  const [view, setView] = useState<'list'>('list')
  const [selectedAgent, setSelectedAgent] = useState<number | null>(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewAgentModal, setShowNewAgentModal] = useState(false)
  
  const currentAgent = agents.find(agent => agent.id === selectedAgent)
  const activeColors = currentAgent?.colors || agents[0].colors
  
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.agentName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAgentTypeSelect = (type: 'blank' | 'personal' | 'business') => {
    setShowNewAgentModal(false)
    // Navigate to the appropriate agent creation page based on type
    router.push('/agents/new')
  }

  // List View
  if (view === 'list') {
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
                  variant="outline"
                  className="border-gray-300 dark:border-gray-700 hover:bg-primary/5 hover:border-primary/40 text-gray-900 dark:text-white gap-2 flex-1 sm:flex-initial transition-all"
                  onClick={() => router.push('/agents/playground')}
                >
                  <Play className="h-4 w-4" />
                  Playground
                </Button>
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

            {/* Archived Link */}
            <div className="mb-4">
              <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors">
                <Archive className="h-4 w-4" />
                Archived
              </button>
            </div>

            {/* Table - Desktop/Tablet */}
            <div className="hidden md:block border border-gray-200 dark:border-gray-900 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[2fr,1.5fr,1.5fr,auto] gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-900">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Created by</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                  Created at
                  <ChevronDown className="h-4 w-4 text-primary" />
                </div>
                <div className="w-8"></div>
              </div>

              {/* Table Rows */}
              <div className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-900">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="grid grid-cols-[2fr,1.5fr,1.5fr,auto] gap-4 px-6 py-4 hover:bg-primary/5 cursor-pointer transition-colors border-l-2 border-transparent hover:border-primary"
                    onClick={() => router.push('/agents/new')}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</div>
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
                          <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-primary/5">
                            <ExternalLink className="mr-2 h-4 w-4 text-primary" />
                            SDK docs
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-primary/5">
                            <ExternalLink className="mr-2 h-4 w-4 text-primary" />
                            Conversation history
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-900" />
                          <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate agent
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                            <Archive className="mr-2 h-4 w-4" />
                            Archive agent
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete agent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="border border-gray-200 dark:border-gray-900 rounded-lg p-4 hover:bg-primary/5 hover:border-primary/40 cursor-pointer transition-all"
                  onClick={() => router.push('/agents/new')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{agent.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">By {agent.createdBy}</p>
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
                        <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-primary/5">
                          <ExternalLink className="mr-2 h-4 w-4 text-primary" />
                          SDK docs
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-primary/5">
                          <ExternalLink className="mr-2 h-4 w-4 text-primary" />
                          Conversation history
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-900" />
                        <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate agent
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                          <Archive className="mr-2 h-4 w-4" />
                          Archive agent
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete agent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    {agent.createdAt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }
}
