"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search as SearchIcon, X, Bot, Megaphone, Phone, Users, BarChart3, Clock, ArrowRight, Mic, History, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearch, useSearchAnalytics } from '@/hooks/use-search'

// --- TYPES ---
interface SearchResult {
  id: string
  title: string
  description: string
  type: 'agent' | 'campaign' | 'contact' | 'call' | 'analytics' | 'voice-clone'
  icon: React.ReactNode
  href: string
  metadata?: {
    status?: string
    date?: string
    count?: number
    color?: string
  }
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

// --- MOCK DATA ---
const mockSearchData: SearchResult[] = [
  // Agents
  {
    id: 'agent-1',
    title: 'Sales Assistant AI',
    description: 'Automated sales calls and lead qualification',
    type: 'agent',
    icon: <Bot className="w-5 h-5" />,
    href: '/agents',
    metadata: { status: 'Active', color: '#10B981' }
  },
  {
    id: 'agent-2',
    title: 'Customer Support Bot',
    description: 'Handle customer inquiries and support tickets',
    type: 'agent',
    icon: <Bot className="w-5 h-5" />,
    href: '/agents',
    metadata: { status: 'Training', color: '#F59E0B' }
  },
  {
    id: 'agent-3',
    title: 'Lead Qualifier',
    description: 'Qualify incoming leads and schedule meetings',
    type: 'agent',
    icon: <Bot className="w-5 h-5" />,
    href: '/agents',
    metadata: { status: 'Active', color: '#10B981' }
  },
  {
    id: 'agent-new',
    title: 'Create New Agent',
    description: 'Set up a new AI agent for your campaigns',
    type: 'agent',
    icon: <Bot className="w-5 h-5" />,
    href: '/agents/new',
    metadata: { status: 'Action', color: '#3B82F6' }
  },

  // Campaigns
  {
    id: 'campaign-1',
    title: 'Summer Outreach 2024',
    description: 'Q3 lead generation campaign targeting SMBs',
    type: 'campaign',
    icon: <Megaphone className="w-5 h-5" />,
    href: '/campaigns',
    metadata: { status: 'Running', date: '2024-07-15', color: '#3B82F6' }
  },
  {
    id: 'campaign-2',
    title: 'Product Launch Campaign',
    description: 'Announce new AI features to existing customers',
    type: 'campaign',
    icon: <Megaphone className="w-5 h-5" />,
    href: '/campaigns',
    metadata: { status: 'Completed', date: '2024-06-30', color: '#10B981' }
  },
  {
    id: 'campaign-3',
    title: 'Holiday Promotion',
    description: 'End of year special offers and discounts',
    type: 'campaign',
    icon: <Megaphone className="w-5 h-5" />,
    href: '/campaigns',
    metadata: { status: 'Scheduled', date: '2024-12-01', color: '#8B5CF6' }
  },
  {
    id: 'campaign-new',
    title: 'Create New Campaign',
    description: 'Launch a new marketing campaign',
    type: 'campaign',
    icon: <Megaphone className="w-5 h-5" />,
    href: '/campaigns/new',
    metadata: { status: 'Action', color: '#3B82F6' }
  },

  // Contacts
  {
    id: 'contact-1',
    title: 'John Smith',
    description: 'CEO at TechCorp - High priority lead',
    type: 'contact',
    icon: <Users className="w-5 h-5" />,
    href: '/contacts',
    metadata: { status: 'Hot Lead', color: '#EF4444' }
  },
  {
    id: 'contact-2',
    title: 'Sarah Johnson',
    description: 'Marketing Director at StartupXYZ',
    type: 'contact',
    icon: <Users className="w-5 h-5" />,
    href: '/contacts',
    metadata: { status: 'Qualified', color: '#10B981' }
  },
  {
    id: 'contact-3',
    title: 'Mike Davis',
    description: 'Operations Manager at BigCorp',
    type: 'contact',
    icon: <Users className="w-5 h-5" />,
    href: '/contacts',
    metadata: { status: 'Follow-up', color: '#F59E0B' }
  },

  // Calls
  {
    id: 'call-1',
    title: 'Call with TechCorp',
    description: 'Discovery call about AI implementation',
    type: 'call',
    icon: <Phone className="w-5 h-5" />,
    href: '/calls',
    metadata: { date: '2024-10-20', status: 'Completed', color: '#10B981' }
  },
  {
    id: 'call-2',
    title: 'Follow-up with StartupXYZ',
    description: 'Discuss pricing and implementation timeline',
    type: 'call',
    icon: <Phone className="w-5 h-5" />,
    href: '/calls',
    metadata: { date: '2024-10-21', status: 'Scheduled', color: '#3B82F6' }
  },

  // Voice Clones
  {
    id: 'voice-1',
    title: 'Professional Male Voice',
    description: 'Deep, authoritative voice for B2B calls',
    type: 'voice-clone',
    icon: <Mic className="w-5 h-5" />,
    href: '/voice-cloning',
    metadata: { status: 'Ready', color: '#10B981' }
  },
  {
    id: 'voice-2',
    title: 'Friendly Female Voice',
    description: 'Warm, approachable voice for customer support',
    type: 'voice-clone',
    icon: <Mic className="w-5 h-5" />,
    href: '/voice-cloning',
    metadata: { status: 'Training', color: '#F59E0B' }
  },
  {
    id: 'voice-new',
    title: 'Create New Voice Clone',
    description: 'Train a new AI voice for your campaigns',
    type: 'voice-clone',
    icon: <Mic className="w-5 h-5" />,
    href: '/voice-cloning/new',
    metadata: { status: 'Action', color: '#3B82F6' }
  },

  // Analytics
  {
    id: 'analytics-1',
    title: 'Call Performance Report',
    description: 'Weekly performance metrics and insights',
    type: 'analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    href: '/analytics',
    metadata: { date: '2024-10-21', count: 247 }
  },
  {
    id: 'analytics-2',
    title: 'Campaign ROI Analysis',
    description: 'Return on investment for all campaigns',
    type: 'analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    href: '/analytics',
    metadata: { date: '2024-10-20', count: 12 }
  },

  // Dashboard & Settings
  {
    id: 'dashboard-1',
    title: 'Dashboard Overview',
    description: 'Main dashboard with key metrics and insights',
    type: 'analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    href: '/dashboard',
    metadata: { status: 'Live', color: '#10B981' }
  },
  {
    id: 'settings-1',
    title: 'Account Settings',
    description: 'Manage your account preferences and configuration',
    type: 'analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    href: '/settings',
    metadata: { status: 'Available', color: '#6B7280' }
  }
]

// --- SEARCH CATEGORIES ---
const searchCategories = {
  agent: { label: 'Agents', color: 'text-primary dark:text-primary' },
  campaign: { label: 'Campaigns', color: 'text-purple-600 dark:text-purple-400' },
  contact: { label: 'Contacts', color: 'text-green-600 dark:text-green-400' },
  call: { label: 'Calls', color: 'text-orange-600 dark:text-orange-400' },
  'voice-clone': { label: 'Voice Clones', color: 'text-pink-600 dark:text-pink-400' },
  analytics: { label: 'Analytics', color: 'text-indigo-600 dark:text-indigo-400' }
}

// --- SEARCH RESULT COMPONENT ---
const SearchResultItem: React.FC<{ result: SearchResult; onSelect: () => void }> = ({ result, onSelect }) => (
  <div
    onClick={onSelect}
    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors group"
  >
    <div className={cn("p-2 rounded-md", `bg-${result.type === 'agent' ? 'blue' : result.type === 'campaign' ? 'purple' : result.type === 'contact' ? 'green' : result.type === 'call' ? 'orange' : result.type === 'voice-clone' ? 'pink' : 'indigo'}-100 dark:bg-${result.type === 'agent' ? 'blue' : result.type === 'campaign' ? 'purple' : result.type === 'contact' ? 'green' : result.type === 'call' ? 'orange' : result.type === 'voice-clone' ? 'pink' : 'indigo'}-950`)}>
      <div className={searchCategories[result.type].color}>
        {result.icon}
      </div>
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h4 className="font-medium text-gray-900 dark:text-white truncate">{result.title}</h4>
        {result.metadata?.status && (
          <span 
            className="px-2 py-1 text-xs rounded-full text-white"
            style={{ backgroundColor: result.metadata.color }}
          >
            {result.metadata.status}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{result.description}</p>
      {result.metadata?.date && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          <Clock className="w-3 h-3 inline mr-1" />
          {result.metadata.date}
        </p>
      )}
    </div>
    
    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
  </div>
)

// --- MAIN COMPONENT ---
export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Use search hook for debouncing and recent searches
  const { debouncedTerm, recentSearches, addToRecentSearches, clearRecentSearches } = useSearch(searchTerm)
  const { trackSearch, trackSearchClick } = useSearchAnalytics()

  // Filter results based on debounced search term
  const filteredResults = useMemo(() => {
    if (!debouncedTerm.trim()) return mockSearchData.slice(0, 8) // Show recent/popular items
    
    const results = mockSearchData.filter(item =>
      item.title.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
      searchCategories[item.type].label.toLowerCase().includes(debouncedTerm.toLowerCase())
    )
    
    // Track search analytics
    trackSearch(debouncedTerm, results.length)
    
    return results
  }, [debouncedTerm, trackSearch])

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    filteredResults.forEach(result => {
      if (!groups[result.type]) groups[result.type] = []
      groups[result.type].push(result)
    })
    return groups
  }, [filteredResults])

  const handleSelectResult = useCallback((result: SearchResult, position?: number) => {
    // Add to recent searches
    if (searchTerm.trim()) {
      addToRecentSearches(searchTerm)
    }
    
    // Track click analytics
    if (position !== undefined) {
      trackSearchClick(searchTerm, result.id, position)
    }
    
    // Navigate using Next.js router for better performance
    console.log('Navigating to:', result.href)
    router.push(result.href)
    onClose()
  }, [searchTerm, addToRecentSearches, trackSearchClick, router, onClose])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredResults[selectedIndex]) {
            handleSelectResult(filteredResults[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredResults, onClose, handleSelectResult])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSearchTerm('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  const handleRecentSearchClick = (recentTerm: string) => {
    setSearchTerm(recentTerm)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] sm:pt-[10vh] pointer-events-none px-2 sm:px-4">
        <div className="w-full max-w-2xl pointer-events-auto animate-in slide-in-from-top duration-200">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Search Input */}
            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-900 bg-white dark:bg-black">
              <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search agents, campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-base sm:text-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md transition-colors text-gray-600 dark:text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!searchTerm.trim() && recentSearches.length > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-900 bg-white dark:bg-black">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.slice(0, 6).map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(term)}
                        className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredResults.length === 0 && searchTerm.trim() ? (
                <div className="p-8 text-center text-gray-600 dark:text-gray-400 bg-white dark:bg-black">
                  <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-900 dark:text-white">No results found for &quot;{searchTerm}&quot;</p>
                  <p className="text-sm mt-2">Try searching for agents, campaigns, contacts, or calls</p>
                </div>
              ) : !searchTerm.trim() && recentSearches.length === 0 ? (
                <div className="p-8 text-center text-gray-600 dark:text-gray-400 bg-white dark:bg-black">
                  <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-900 dark:text-white">Start typing to search across your platform</p>
                  <p className="text-sm mt-2">Search agents, campaigns, contacts, calls, and more</p>
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="p-2 bg-white dark:bg-black">
                  {Object.entries(groupedResults).map(([type, results]) => (
                    <div key={type} className="mb-6 last:mb-2">
                      <h3 className={cn(
                        "text-sm font-semibold mb-2 px-2",
                        searchCategories[type as keyof typeof searchCategories].color
                      )}>
                        {searchCategories[type as keyof typeof searchCategories].label} ({results.length})
                      </h3>
                      <div className="space-y-1">
                        {results.map((result, index) => {
                          const globalIndex = filteredResults.indexOf(result)
                          return (
                            <div
                              key={result.id}
                              className={cn(
                                "rounded-lg",
                                selectedIndex === globalIndex && "bg-gray-100 dark:bg-gray-900"
                              )}
                            >
                              <SearchResultItem
                                result={result}
                                onSelect={() => handleSelectResult(result, globalIndex)}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Show popular items when no search term and no recent searches */}
              {!searchTerm.trim() && recentSearches.length === 0 && (
                <div className="p-2 bg-white dark:bg-black">
                  <h3 className="text-sm font-semibold mb-2 px-2 text-gray-600 dark:text-gray-400">
                    Popular Items
                  </h3>
                  <div className="space-y-1">
                    {mockSearchData.slice(0, 6).map((result, index) => (
                      <div key={result.id} className="rounded-lg">
                        <SearchResultItem
                          result={result}
                          onSelect={() => handleSelectResult(result, index)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredResults.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-xs text-gray-600">
                <div className="flex items-center gap-4">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>Esc Close</span>
                </div>
                <span>{filteredResults.length} results</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
