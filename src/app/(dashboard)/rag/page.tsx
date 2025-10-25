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
import { NewSourcePanel } from '@/components/rag/new-source-panel'
import { Globe, FileText, Type, Search, Plus, Database } from 'lucide-react'

export default function RAGCollectionsPage() {
  const [newSourceOpen, setNewSourceOpen] = useState(false)
  const [addUrlOpen, setAddUrlOpen] = useState(false)
  const [addFilesOpen, setAddFilesOpen] = useState(false)
  const [createTextOpen, setCreateTextOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [textName, setTextName] = useState('')
  const [textContent, setTextContent] = useState('')
  
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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-gray-700 dark:text-gray-300">
                RAG Storage: <strong className="text-gray-900 dark:text-white">0 B</strong> / <strong className="text-gray-900 dark:text-white">1.0 MB</strong>
              </span>
            </div>
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
            onClick={() => setAddFilesOpen(true)}
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

        {/* Empty State */}
        <Card className="border-gray-200 dark:border-gray-900">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 mb-4">
              <Database className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No documents found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You don&apos;t have any documents yet.
            </p>
          </CardContent>
        </Card>
      </div>

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
                className="w-full min-h-[200px] px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
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
              Add Files
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
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
          <div className="flex justify-end">
            <Button 
              className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
              onClick={() => {
                // Handle file submission here
                console.log('Adding files:', selectedFiles)
                setSelectedFiles([])
                setAddFilesOpen(false)
              }}
            >
              Add File
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Source Panel */}
      <NewSourcePanel isOpen={newSourceOpen} onClose={() => setNewSourceOpen(false)} />
    </AppLayout>
  )
}

