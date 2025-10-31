'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AddCustomVoiceModal } from '@/components/voice/add-custom-voice-modal'
import { AgentIcon } from '@/components/agent-icon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  MoreVertical, 
  Mic, 
  Play, 
  ChevronDown,
  ArrowUpDown,
  Filter,
  X,
  Plus,
  Users,
  MessageCircle,
  Info,
  Sparkles,
  Wand2,
  Lock,
  Shuffle,
  Smile
} from 'lucide-react'


// Mock data for voices
const mockVoices = [
  {
    id: '1',
    name: 'Grandpa Spuds Oxley',
    description: 'A friendly grandpa who knows how to...',
    avatar: '',
    language: 'English',
    languageCode: 'en-US',
    variant: '+14',
    flag: '🇺🇸',
    accent: 'American',
    category: 'Conversational',
    age: '2y',
    usageCount: '751.2K',
  },
  {
    id: '2',
    name: 'Eryn - Hyper Real & Conversation',
    description: 'This model was trained from a real...',
    avatar: '',
    language: 'English',
    languageCode: 'en-US',
    variant: '+2',
    flag: '🇺🇸',
    accent: 'American',
    category: 'Conversational',
    age: '2y',
    usageCount: '2.3K',
  },
  {
    id: '3',
    name: 'Grandfather Joe - Gentle, warm & wise',
    description: 'A warm, conversational old-age British...',
    avatar: '',
    language: 'English',
    languageCode: 'en-GB',
    variant: '',
    flag: '🇬🇧',
    accent: 'British',
    category: 'Conversational',
    age: '2y',
    usageCount: '35K',
  },
  {
    id: '4',
    name: 'Jessica Anne Bogart - Conversations',
    description: 'Friendly and Conversational Female...',
    avatar: '',
    language: 'English',
    languageCode: 'en-US',
    variant: '+13',
    flag: '🇺🇸',
    accent: 'American',
    category: 'Conversational',
    age: '2y',
    usageCount: '89.8K',
  },
  {
    id: '5',
    name: 'Dakota H',
    description: 'Middle-aged African American souther...',
    avatar: '',
    language: 'English',
    languageCode: 'en-US',
    variant: '+12',
    flag: '🇺🇸',
    accent: 'American',
    category: 'Conversational',
    age: '2y',
    usageCount: '19.1K',
  },
  {
    id: '6',
    name: 'Adam',
    description: 'Conversational, velvet voice of a Czec...',
    avatar: '',
    language: 'Czech',
    languageCode: 'cs-CZ',
    variant: '+13',
    flag: '🇨🇿',
    accent: 'Standard',
    category: 'Conversational',
    age: '2y',
    usageCount: '57.7K',
  },
  {
    id: '7',
    name: 'Tara - Expressive Conversational Hind...',
    description: "Tara's English voice has already...",
    avatar: '',
    language: 'Hindi',
    languageCode: 'hi-IN',
    variant: '+12',
    flag: '🇮🇳',
    accent: 'Standard',
    category: 'Conversational',
    age: '2y',
    usageCount: '17.1K',
  },
  {
    id: '8',
    name: 'Jenna - Warm and Articulate',
    description: 'A 30 year old female voice in American...',
    avatar: '',
    language: 'English',
    languageCode: 'en-CA',
    variant: '+9',
    flag: '🇨🇦',
    accent: 'Canadian',
    category: 'Conversational',
    age: '2y',
    usageCount: '5K',
  },
]

interface MyVoice {
  id: string
  name: string
  description: string
  language: string
  languageCode: string
  accent: string
  category: string
  createdAt: Date
  source: 'voice-clone' | 'community-voices'
  provider?: string
}

export default function VoiceCloningPage() {
  const [activeTab, setActiveTab] = useState('explore')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Conversational')
  const [filterCount, setFilterCount] = useState(1)
  const [createVoiceDialogOpen, setCreateVoiceDialogOpen] = useState(false)
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [myVoices, setMyVoices] = useState<MyVoice[]>([])
  
  // Filter states
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedAccent, setSelectedAccent] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Conversational'])
  const [selectedQuality, setSelectedQuality] = useState('Any')
  const [selectedGender, setSelectedGender] = useState('Any')
  const [selectedAge, setSelectedAge] = useState('Any')
  const [selectedNoticePeriod, setSelectedNoticePeriod] = useState('Any')
  const [customRates, setCustomRates] = useState('Include')
  const [liveModerationEnabled, setLiveModerationEnabled] = useState('Include')

  const filteredVoices = mockVoices.filter(voice =>
    voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voice.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMyVoices = myVoices.filter(voice =>
    voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voice.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddVoice = (voiceData: { name: string; source: 'voice-clone' | 'community-voices'; provider?: string }) => {
    console.log('Adding voice:', voiceData)
    const newVoice: MyVoice = {
      id: `my-voice-${Date.now()}`,
      name: voiceData.name,
      description: `${voiceData.source === 'voice-clone' ? 'Cloned voice' : `Voice from ${voiceData.provider || 'Community'}`}`,
      language: 'English',
      languageCode: 'en-US',
      accent: 'Standard',
      category: 'Conversational',
      createdAt: new Date(),
      source: voiceData.source,
      provider: voiceData.provider,
    }
    console.log('New voice created:', newVoice)
    setMyVoices(prev => {
      const updated = [...prev, newVoice]
      console.log('Updated voices list:', updated)
      return updated
    })
    setCreateVoiceDialogOpen(false)
    // Switch to My Voices tab to show the newly added voice
    setActiveTab('my-voices')
    // Clear search to show all voices
    setSearchQuery('')
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Navigation and Actions */}
        <div className="flex items-center justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 text-sm font-medium pb-1 border-b-2 transition-all duration-200 ${
                activeTab === 'explore'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-primary hover:border-primary/40'
              }`}
            >
              <Mic className="h-4 w-4" />
              Explore
            </button>
            <button
              onClick={() => setActiveTab('my-voices')}
              className={`text-sm font-medium pb-1 border-b-2 transition-all duration-200 ${
                activeTab === 'my-voices'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-primary hover:border-primary/40'
              }`}
            >
              My Voices
                  </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-700" />
              <span>0/3 slots used</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={() => setFeedbackDialogOpen(true)}
            >
              <MessageCircle className="h-4 w-4" />
              Feedback
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
              placeholder={
                activeTab === 'my-voices' 
                  ? 'Search My Voices...' 
                  : 'Search library voices...'
              }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {activeTab === 'explore' && (
              <>
                <Button variant="ghost" className="gap-2 hidden sm:flex">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="gap-2 hidden md:flex">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden lg:inline">Trending</span>
                </Button>
              </>
            )}
            {activeTab === 'my-voices' && (
              <Button variant="ghost" className="gap-2 hidden sm:flex">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden lg:inline">Latest</span>
              </Button>
            )}
            {activeTab === 'explore' && (
              <Button 
                variant="ghost" 
                className="gap-2 flex-shrink-0"
                onClick={() => setFiltersDialogOpen(true)}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeTab === 'explore' && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {filterCount}
                  </Badge>
                )}
              </Button>
            )}
            <Button 
              onClick={() => setCreateVoiceDialogOpen(true)}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white gap-2 flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Voice
            </Button>
          </div>
        </div>

        {/* Explore Tab Content */}
        {activeTab === 'explore' && (
          <>
            {/* Active Filters */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-900 rounded-md text-sm">
                <span className="text-gray-600 dark:text-gray-400">Category</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedCategory}</span>
                <button
                  onClick={() => setSelectedCategory('')}
                  className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <button className="text-sm text-primary hover:text-primary/80 underline font-medium">
                Reset filters
              </button>
            </div>

            {/* Results Header */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Results</h2>

            {/* Voices List */}
            <div className="space-y-3">
          {filteredVoices.map((voice) => (
                <div
                  key={voice.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-900 rounded-lg hover:bg-primary/5 hover:border-primary/40 transition-all"
                >
                  {/* Top Row - Mobile */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={voice.avatar} alt={voice.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm">
                        {voice.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Voice Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {voice.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {voice.description}
                      </p>
                      {/* Mobile: Show language inline */}
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1 sm:hidden">
                        <span>{voice.flag}</span>
                        <span>{voice.language}</span>
                        <span>•</span>
                        <span>{voice.accent}</span>
                      </div>
                    </div>

                    {/* Actions - Mobile */}
                    <div className="flex items-center gap-1 sm:hidden flex-shrink-0">
                      <button className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                        <Play className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-900">
                            <MoreVertical className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-900">
                          <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">Add to Agent</DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">Clone Voice</DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">View Details</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Desktop/Tablet Additional Info */}
                  <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                    {/* Language */}
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 min-w-[140px]">
                      <span className="text-lg">{voice.flag}</span>
                      <div>
                        <div className="font-medium">
                          {voice.language} {voice.variant && <span className="text-gray-500 dark:text-gray-500">{voice.variant}</span>}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">{voice.accent}</div>
                      </div>
                    </div>

                    {/* Category - Hidden on tablet */}
                    <div className="hidden lg:block text-sm text-gray-700 dark:text-gray-300 min-w-[120px]">
                      {voice.category}
                    </div>

                    {/* Age - Hidden on tablet */}
                    <div className="hidden lg:block text-sm text-gray-600 dark:text-gray-400 min-w-[40px]">
                      {voice.age}
                    </div>

                    {/* Usage Count */}
                    <div className="text-sm font-medium text-gray-900 dark:text-white min-w-[60px] text-right">
                      {voice.usageCount}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                        <Play className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-900">
                            <MoreVertical className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-900">
                          <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">Add to Agent</DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">Clone Voice</DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">View Details</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* My Voices Tab Content */}
        {activeTab === 'my-voices' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Voices</h2>
            
            {filteredMyVoices.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-full border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-black" />
                  <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                    <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No voice found
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                  Add some from library
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                  or create a new voice
                </p>
                <Button 
                  onClick={() => setCreateVoiceDialogOpen(true)}
                  variant="outline" 
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create a voice
                </Button>
              </div>
            ) : (
              /* Voices List */
              <div className="space-y-3">
                {filteredMyVoices.map((voice, index) => {
                  // Generate a numeric ID for the icon based on the voice's position
                  const iconId = index + 1000
                  return (
                  <div
                    key={voice.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-900 rounded-lg hover:bg-primary/5 hover:border-primary/40 transition-all"
                  >
                    {/* Top Row - Mobile */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Voice Icon - using AgentIcon with unique gradient */}
                      <AgentIcon agentId={iconId} size={40} />

                      {/* Voice Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {voice.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {voice.description}
                        </p>
                        {/* Mobile: Show language inline */}
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1 sm:hidden">
                          <span>{voice.language}</span>
                          <span>•</span>
                          <span>{voice.accent}</span>
                        </div>
                      </div>

                      {/* Actions - Mobile */}
                      <div className="flex items-center gap-1 sm:hidden flex-shrink-0">
                        <button className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                          <Play className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-900">
                              <MoreVertical className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-900">
                            <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">Add to Agent</DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">Edit Voice</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Desktop/Tablet Additional Info */}
                    <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                      {/* Language */}
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 min-w-[140px]">
                        <div>
                          <div className="font-medium">{voice.language}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">{voice.accent}</div>
                        </div>
                      </div>

                      {/* Category - Hidden on tablet */}
                      <div className="hidden lg:block text-sm text-gray-700 dark:text-gray-300 min-w-[120px]">
                        {voice.category}
                      </div>

                      {/* Created Date */}
                      <div className="hidden lg:block text-sm text-gray-600 dark:text-gray-400 min-w-[120px]">
                        {voice.createdAt.toLocaleDateString()}
                      </div>

                      {/* Source */}
                      <div className="text-sm font-medium text-gray-900 dark:text-white min-w-[100px] text-right">
                        {voice.source === 'voice-clone' ? 'Cloned' : voice.provider || 'Community'}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                          <Play className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-900">
                              <MoreVertical className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-900">
                            <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">Add to Agent</DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">Edit Voice</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            )}
          </>
        )}


        {/* Add Custom Voice Modal */}
        <AddCustomVoiceModal
          isOpen={createVoiceDialogOpen}
          onClose={() => setCreateVoiceDialogOpen(false)}
          onSave={handleAddVoice}
        />


        {/* Voice Filters Dialog */}
        <Dialog open={filtersDialogOpen} onOpenChange={setFiltersDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                <Filter className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                Voice Filters
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Languages and Accent */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Languages</label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Accent</label>
                  <Select value={selectedAccent} onValueChange={setSelectedAccent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose accent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="american">American</SelectItem>
                      <SelectItem value="british">British</SelectItem>
                      <SelectItem value="australian">Australian</SelectItem>
                      <SelectItem value="canadian">Canadian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Category</label>
                <div className="flex flex-wrap gap-2">
                  {['Narrative & Story', 'Conversational', 'Characters & Animation', 'Social Media', 'Entertainment & TV', 'Advertisement', 'Informative & Educational'].map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        if (selectedCategories.includes(category)) {
                          setSelectedCategories(selectedCategories.filter(c => c !== category))
                        } else {
                          setSelectedCategories([...selectedCategories, category])
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategories.includes(category)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-primary/10'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Quality</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedQuality('Any')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedQuality === 'Any'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-primary/10'
                    }`}
                  >
                    Any
                  </button>
                  <button
                    onClick={() => setSelectedQuality('High-Quality')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedQuality === 'High-Quality'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-primary/10'
                    }`}
                  >
                    High-Quality
                  </button>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Gender</label>
                <div className="grid grid-cols-4 gap-3">
                  {['Any', 'Male', 'Female', 'Neutral'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setSelectedGender(gender)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedGender === gender
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      {gender === 'Male' && '♂ '}
                      {gender === 'Female' && '♀ '}
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Age</label>
                <div className="grid grid-cols-4 gap-3">
                  {['Any', 'Young', 'Middle Aged', 'Old'].map((age) => (
                    <button
                      key={age}
                      onClick={() => setSelectedAge(age)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedAge === age
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notice period */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Notice period</label>
                <div className="grid grid-cols-6 gap-2">
                  {['Any', '30 days', '90 days', '180 days', '1 year', '2 years'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedNoticePeriod(period)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedNoticePeriod === period
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom rates */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Custom rates</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCustomRates('Include')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      customRates === 'Include'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-primary/10'
                    }`}
                  >
                    Include
                  </button>
                  <button
                    onClick={() => setCustomRates('Exclude')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      customRates === 'Exclude'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-primary/10'
                    }`}
                  >
                    Exclude
                  </button>
                </div>
              </div>

              {/* Live moderation enabled */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Live moderation enabled</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLiveModerationEnabled('Include')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      liveModerationEnabled === 'Include'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-primary/10'
                    }`}
                  >
                    Include
                  </button>
                  <button
                    onClick={() => setLiveModerationEnabled('Exclude')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      liveModerationEnabled === 'Exclude'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-primary/10'
                    }`}
                  >
                    Exclude
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-900">
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedLanguage('')
                  setSelectedAccent('')
                  setSelectedCategories([])
                  setSelectedQuality('Any')
                  setSelectedGender('Any')
                  setSelectedAge('Any')
                  setSelectedNoticePeriod('Any')
                  setCustomRates('Include')
                  setLiveModerationEnabled('Include')
                }}
              >
                Reset all
              </Button>
                <Button 
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30"
                onClick={() => {
                  console.log('Applying filters:', {
                    language: selectedLanguage,
                    accent: selectedAccent,
                    categories: selectedCategories,
                    quality: selectedQuality,
                    gender: selectedGender,
                    age: selectedAge,
                    noticePeriod: selectedNoticePeriod,
                    customRates,
                    liveModerationEnabled
                  })
                  setFiltersDialogOpen(false)
                }}
              >
                Apply filters
                </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
          <DialogContent className="max-w-md bg-white dark:bg-black border-gray-200 dark:border-gray-900">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">Feedback</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="relative">
                <textarea
                  placeholder="Type your feedback here..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full min-h-[120px] px-4 py-3 pr-12 text-sm text-gray-900 dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-primary dark:focus:border-primary resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
                <button 
                  className="absolute bottom-3 right-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
                  type="button"
                >
                  <Smile className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  We don&apos;t respond to submissions, but we read all of them carefully
                </p>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 flex-shrink-0"
                  onClick={() => {
                    console.log('Feedback submitted:', feedbackText)
                    setFeedbackText('')
                    setFeedbackDialogOpen(false)
                  }}
                >
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

