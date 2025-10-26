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
import { Globe, FileText, Type, Search, Plus, Database, Folder, FolderPlus, ChevronRight, ChevronDown, MoreVertical, Edit, Trash } from 'lucide-react'

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
  const [knowledgeHubs, setKnowledgeHubs] = useState(mockKnowledgeHubs)
  
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-gray-700 dark:text-gray-300">
                RAG Storage: <strong className="text-gray-900 dark:text-white">0 B</strong> / <strong className="text-gray-900 dark:text-white">1.0 MB</strong>
              </span>
            </div>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setCreateHubOpen(true)}
            >
              <FolderPlus className="h-4 w-4" />
              Create Hub
            </Button>
          </div>
        </div>

        {/* Action Cards */}
        <div className="flex gap-3">
          <button
            onClick={() => setAddUrlOpen(true)}
            className="flex flex-col items-center justify-center px-6 py-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all min-w-[140px]"
          >
            <Globe className="h-6 w-6 text-gray-700 dark:text-gray-300 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add URL</span>
          </button>
          <button
            onClick={() => {
              setSelectedHub(null)
              setAddFilesOpen(true)
            }}
            className="flex flex-col items-center justify-center px-6 py-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all min-w-[140px]"
          >
            <FileText className="h-6 w-6 text-gray-700 dark:text-gray-300 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Files</span>
          </button>
          <button
            onClick={() => setCreateTextOpen(true)}
            className="flex flex-col items-center justify-center px-6 py-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all min-w-[140px]"
          >
            <Type className="h-6 w-6 text-gray-700 dark:text-gray-300 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Create Text</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search Knowledge Base..."
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] bg-white dark:bg-black border-gray-200 dark:border-gray-900">
              <DropdownMenuItem className="flex items-center gap-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                <FileText className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                <span>File</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                <Globe className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                <span>URL</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                <Type className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                <span>Text</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Knowledge Hubs List */}
        {knowledgeHubs.length > 0 ? (
          <div className="space-y-3">
            {knowledgeHubs.map((hub) => (
              <Card key={hub.id} className="border-gray-200 dark:border-gray-900">
                <CardContent className="p-0">
                  {/* Hub Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-900 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleHub(hub.id)}
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      >
                        {expandedHubs.includes(hub.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <Folder className="h-5 w-5 text-primary dark:text-primary" />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{hub.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{hub.filesCount} files</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          setSelectedHub(hub.id)
                          setAddFilesOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add Files
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-900">
                          <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                            <Edit className="mr-2 h-4 w-4" />
                            Rename Hub
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-900">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Hub
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {/* Hub Files */}
                  {expandedHubs.includes(hub.id) && hub.files && hub.files.length > 0 && (
                    <div className="divide-y divide-gray-200 dark:divide-gray-900">
                      {hub.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900">
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{file.size} MB</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-900">
                              <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-900">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete File
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Empty state for hub with no files */}
                  {expandedHubs.includes(hub.id) && (!hub.files || hub.files.length === 0) && (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">No files in this hub yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="border-gray-200 dark:border-gray-900">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 mb-4">
                <Database className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No knowledge hubs found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create your first knowledge hub to organize your documents.
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setCreateHubOpen(true)}
              >
                <FolderPlus className="h-4 w-4" />
                Create First Hub
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
              Add Files {selectedHub && `to ${knowledgeHubs.find(h => h.id === selectedHub)?.name}`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Hub Selector */}
            {!selectedHub && knowledgeHubs.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Select Knowledge Hub</label>
                <Select value={selectedHub || ''} onValueChange={setSelectedHub}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a hub to add files to" />
                  </SelectTrigger>
                  <SelectContent>
                    {knowledgeHubs.map((hub) => (
                      <SelectItem key={hub.id} value={hub.id}>
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-primary dark:text-primary" />
                          {hub.name}
                        </div>
                      </SelectItem>
                    ))}
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
                setSelectedHub(null)
                setSelectedFiles([])
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
              disabled={!selectedHub && knowledgeHubs.length > 0}
              onClick={() => {
                console.log('Adding files to hub:', selectedHub, 'Files:', selectedFiles)
                setSelectedFiles([])
                setSelectedHub(null)
                setAddFilesOpen(false)
              }}
            >
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

