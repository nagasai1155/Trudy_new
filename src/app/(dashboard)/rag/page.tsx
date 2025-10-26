'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NewSourcePanel } from '@/components/rag/new-source-panel'
import { Globe, FileText, Type, Search, Plus, Database, Folder, FolderPlus, ChevronRight, ChevronDown, MoreVertical, Edit, Trash, Headphones, Wind, TrendingUp, Wand2, BookOpen, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Local types for RAG page
interface AgentKnowledgeBase {
  filesCount: number
  sources: string[]
  files?: Array<{
    id: string
    name: string
    type: string
    size: number
    uploadedAt: string
  }>
}

interface AgentWithKnowledgeBase {
  id: string
  name: string
  description: string
  agentName: string
  avatar: string
  icon: any
  knowledgeBase: AgentKnowledgeBase | null
}

// Mock agents data (this would come from useAgents hook in production)
const mockAgents: AgentWithKnowledgeBase[] = [
  {
    id: '1',
    name: 'Support agent',
    description: 'Dedicated support agent ready to resolve customer issues',
    agentName: 'Alexis',
    avatar: '👩',
    icon: Headphones,
    knowledgeBase: null, // No knowledge base yet
  },
  {
    id: '2',
    name: 'Mindfulness coach',
    description: 'Helps users find calm and clarity through mindfulness',
    agentName: 'Joe',
    avatar: '🧘',
    icon: Wind,
    knowledgeBase: null, // No knowledge base yet
  },
  {
    id: '3',
    name: 'Sales agent',
    description: 'Showcases products and helps close deals',
    agentName: 'Harper',
    avatar: '💼',
    icon: TrendingUp,
    knowledgeBase: null, // No knowledge base yet
  },
  {
    id: '4',
    name: 'Video game character',
    description: 'Mysterious wizard offering ancient wisdom',
    agentName: 'Callum',
    avatar: '🧙',
    icon: Wand2,
    knowledgeBase: null, // No knowledge base yet
  },
]

// Mock data for knowledge hubs
const mockKnowledgeHubs = [
  {
    id: '1',
    name: 'Products Overview',
    filesCount: 5,
    createdAt: new Date('2024-02-10'),
    files: [
      { id: 'f1', name: 'Product Catalog.pdf', type: 'pdf', size: 2.5 },
      { id: 'f2', name: 'Features Guide.docx', type: 'docx', size: 1.2 },
      { id: 'f3', name: 'Pricing Sheet.xlsx', type: 'xlsx', size: 0.8 },
    ]
  },
  {
    id: '2',
    name: 'Customer Support',
    filesCount: 3,
    createdAt: new Date('2024-02-12'),
    files: [
      { id: 'f4', name: 'FAQ.txt', type: 'txt', size: 0.5 },
      { id: 'f5', name: 'Support Guide.pdf', type: 'pdf', size: 3.1 },
    ]
  },
]

export default function RAGCollectionsPage() {
  const router = useRouter()
  const [newSourceOpen, setNewSourceOpen] = useState(false)
  const [addUrlOpen, setAddUrlOpen] = useState(false)
  const [addFilesOpen, setAddFilesOpen] = useState(false)
  const [createTextOpen, setCreateTextOpen] = useState(false)
  const [createHubOpen, setCreateHubOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [textName, setTextName] = useState('')
  const [textContent, setTextContent] = useState('')
  const [hubName, setHubName] = useState('')
  const [hubDescription, setHubDescription] = useState('')
  const [expandedHubs, setExpandedHubs] = useState<string[]>(['1'])
  const [selectedHub, setSelectedHub] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [viewingAgent, setViewingAgent] = useState<string | null>(null)
  const [knowledgeHubs, setKnowledgeHubs] = useState(mockKnowledgeHubs)
  const [agents, setAgents] = useState<AgentWithKnowledgeBase[]>(mockAgents)
  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const toggleHub = (hubId: string) => {
    setExpandedHubs(prev =>
      prev.includes(hubId) ? prev.filter(id => id !== hubId) : [...prev, hubId]
    )
  }
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files))
    }
  }
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleAddFiles = () => {
    if (!selectedAgent || selectedFiles.length === 0) return

    // Create new file entries
    const newFiles = selectedFiles.map((file, index) => ({
      id: `f${Date.now()}-${index}`,
      name: file.name,
      type: file.name.split('.').pop() || 'file',
      size: parseFloat((file.size / 1024 / 1024).toFixed(2)), // Convert bytes to MB
      uploadedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }))

    // Get unique file types from new files
    const fileTypes = Array.from(new Set(newFiles.map(f => f.type.toUpperCase())))

    // Update agents state
    setAgents(prevAgents => 
      prevAgents.map(agent => {
        if (agent.id === selectedAgent) {
          if (agent.knowledgeBase) {
            // Agent already has knowledge base, add to it
            const existingSources = agent.knowledgeBase.sources || []
            const newSources = fileTypes.filter(type => !existingSources.includes(type))
            
            return {
              ...agent,
              knowledgeBase: {
                ...agent.knowledgeBase,
                filesCount: agent.knowledgeBase.filesCount + newFiles.length,
                sources: [...existingSources, ...newSources],
                files: [...(agent.knowledgeBase.files || []), ...newFiles]
              }
            }
          } else {
            // Create new knowledge base for agent
            return {
              ...agent,
              knowledgeBase: {
                filesCount: newFiles.length,
                sources: fileTypes,
                files: newFiles
              }
            }
          }
        }
        return agent
      })
    )

    // Reset form
    setSelectedFiles([])
    setSelectedAgent(null)
    setAddFilesOpen(false)
  }

  const handleDeleteFile = (agentId: string, fileId: string) => {
    setAgents(prevAgents =>
      prevAgents.map(agent => {
        if (agent.id === agentId && agent.knowledgeBase) {
          const updatedFiles = agent.knowledgeBase.files?.filter(f => f.id !== fileId) || []
          
          if (updatedFiles.length === 0) {
            // No files left, remove knowledge base
            return {
              ...agent,
              knowledgeBase: null
            }
          }
          
          // Recalculate sources from remaining files
          const sources = Array.from(new Set(updatedFiles.map(f => f.type.toUpperCase())))
          
          return {
            ...agent,
            knowledgeBase: {
              ...agent.knowledgeBase,
              filesCount: updatedFiles.length,
              sources: sources,
              files: updatedFiles
            }
          }
        }
        return agent
      })
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage knowledge bases for your agents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">0 B</strong> / <strong className="text-gray-900 dark:text-white">1.0 MB</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {agents.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:max-w-md"
            />
          </div>
        )}

        {/* Agent Cards */}
        {agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => {
              const Icon = agent.icon
              const hasKnowledgeBase = agent.knowledgeBase !== null
              
              return (
                <Card 
                  key={agent.id} 
                  className="border-gray-200 dark:border-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                >
                  <CardContent className="p-6">
                    {/* Agent Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary dark:text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {agent.description}
                        </p>
                      </div>
                    </div>

                    {/* Agent Avatar */}
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-900">
                      <span className="text-xl">{agent.avatar}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {agent.agentName}
                      </span>
                    </div>

                    {/* Knowledge Base Status */}
                    {hasKnowledgeBase ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong className="text-gray-900 dark:text-white">{agent.knowledgeBase!.filesCount}</strong> files
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {agent.knowledgeBase!.sources.map((source, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={() => {
                              setSelectedAgent(agent.id)
                              setAddFilesOpen(true)
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add More
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={() => {
                              setViewingAgent(agent.id)
                            }}
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                            View
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center py-4 px-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            No knowledge base yet
                          </p>
                        </div>
                        <Button
                          className="w-full gap-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
                          size="sm"
                          onClick={() => {
                            setSelectedAgent(agent.id)
                            setAddFilesOpen(true)
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Knowledge Base
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          /* Empty State - No Agents */
          <Card className="border-gray-200 dark:border-gray-900">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 mb-4">
                <Database className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No agents found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
                You need to create agents first before you can add knowledge bases to them.
              </p>
              <Button
                className="gap-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
                onClick={() => router.push('/agents')}
              >
                <Plus className="h-4 w-4" />
                Create Your First Agent
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Knowledge Hub Dialog */}
      <Dialog open={createHubOpen} onOpenChange={setCreateHubOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-black border-gray-200 dark:border-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
              <FolderPlus className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              Create Knowledge Hub
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Hub Name</label>
              <Input
                type="text"
                placeholder="e.g., Products Overview, Customer Support"
                value={hubName}
                onChange={(e) => setHubName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Description (Optional)</label>
              <textarea
                placeholder="Brief description of what this hub contains"
                value={hubDescription}
                onChange={(e) => setHubDescription(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-primary dark:focus:border-primary resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateHubOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
              onClick={() => {
                console.log('Creating hub:', { name: hubName, description: hubDescription })
                setHubName('')
                setHubDescription('')
                setCreateHubOpen(false)
              }}
            >
              Create Hub
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add URL Dialog */}
      <Dialog open={addUrlOpen} onOpenChange={setAddUrlOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-black border-gray-200 dark:border-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
              <Globe className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              Add URL
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">URL</label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
              onClick={() => {
                // Handle URL submission here
                console.log('Adding URL:', url)
                setUrl('')
                setAddUrlOpen(false)
              }}
            >
              Add URL
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Text Dialog */}
      <Dialog open={createTextOpen} onOpenChange={setCreateTextOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-black border-gray-200 dark:border-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
              <Type className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              Create Text
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Text Name</label>
              <Input
                type="text"
                placeholder="Enter a name for your text"
                value={textName}
                onChange={(e) => setTextName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Text Content</label>
              <textarea
                placeholder="Enter your text content here"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full min-h-[200px] px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-primary dark:focus:border-primary resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
              onClick={() => {
                // Handle text creation here
                console.log('Creating text:', { name: textName, content: textContent })
                setTextName('')
                setTextContent('')
                setCreateTextOpen(false)
              }}
            >
              Create Text
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Files Dialog */}
      <Dialog open={addFilesOpen} onOpenChange={setAddFilesOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-black border-gray-200 dark:border-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
              <FileText className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              Add Files {selectedAgent && `to ${agents.find(a => a.id === selectedAgent)?.name}`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Agent Selector */}
            {!selectedAgent && agents.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Select Agent</label>
                <Select value={selectedAgent || ''} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an agent to add files to" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => {
                      const Icon = agent.icon
                      return (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary dark:text-primary" />
                            {agent.name}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer"
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                accept=".epub,.pdf,.docx,.txt,.html"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <FileText className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Click or drag files to upload
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Up to 21 MB each.
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded">epub</span>
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded">pdf</span>
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded">docx</span>
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded">txt</span>
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded">html</span>
                  </div>
                </div>
              </label>
            </div>
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAddFilesOpen(false)
                setSelectedAgent(null)
                setSelectedFiles([])
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
              disabled={(!selectedAgent && agents.length > 0) || selectedFiles.length === 0}
              onClick={handleAddFiles}
            >
              Add Files
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Knowledge Base Dialog */}
      <Dialog open={viewingAgent !== null} onOpenChange={(open) => !open && setViewingAgent(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-black border-gray-200 dark:border-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
              <BookOpen className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              Knowledge Base - {agents.find(a => a.id === viewingAgent)?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {viewingAgent && agents.find(a => a.id === viewingAgent)?.knowledgeBase?.files ? (
              <div className="space-y-2">
                {/* File List */}
                <div className="divide-y divide-gray-200 dark:divide-gray-900 border border-gray-200 dark:border-gray-900 rounded-lg overflow-hidden">
                  {agents.find(a => a.id === viewingAgent)?.knowledgeBase?.files?.map((file) => (
                    <div key={file.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            <span>{file.size} MB</span>
                            <span>•</span>
                            <span>Uploaded {file.uploadedAt}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-900">
                          <DropdownMenuItem 
                            className="text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-900"
                            onClick={() => handleDeleteFile(viewingAgent!, file.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete File
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600 dark:text-gray-400">No files in this knowledge base.</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setViewingAgent(null)}
            >
              Close
            </Button>
            <Button 
              className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black gap-2"
              onClick={() => {
                setViewingAgent(null)
                setSelectedAgent(viewingAgent)
                setAddFilesOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Add Files
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Source Panel */}
      <NewSourcePanel isOpen={newSourceOpen} onClose={() => setNewSourceOpen(false)} />
    </AppLayout>
  )
}

