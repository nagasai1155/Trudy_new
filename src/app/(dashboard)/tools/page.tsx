'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AppLayout } from '@/components/layout/app-layout'
import { Wrench, Plus, Search, Webhook, X, Code, Target } from 'lucide-react'

export default function ToolsPage() {
  const [mode, setMode] = useState<'basic' | 'advanced'>('basic')
  const [searchQuery, setSearchQuery] = useState('')
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false)
  const [clientToolDialogOpen, setClientToolDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [toolName, setToolName] = useState('')
  const [toolDescription, setToolDescription] = useState('')
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [timeout, setTimeout] = useState(20)
  const [disableInterruptions, setDisableInterruptions] = useState(false)
  
  // Client tool specific state
  const [clientToolName, setClientToolName] = useState('')
  const [clientToolDescription, setClientToolDescription] = useState('')
  const [waitForResponse, setWaitForResponse] = useState(false)
  const [clientDisableInterruptions, setClientDisableInterruptions] = useState(false)
  const [preToolSpeech, setPreToolSpeech] = useState('Auto')

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integrations</h1>
          
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => setMode('basic')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'basic'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary'
              }`}
            >
              Basic Settings
            </button>
            <button
              onClick={() => setMode('advanced')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'advanced'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary'
              }`}
            >
              Advanced Mode
            </button>
          </div>
        </div>

        {/* Content based on mode */}
        {mode === 'basic' && (
          <>
            {/* Basic Settings View */}
            <div className="flex gap-3">
          <button
            onClick={() => setWebhookDialogOpen(true)}
            className="flex items-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            <Webhook className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add webhook tool</span>
          </button>
          <button
            onClick={() => setClientToolDialogOpen(true)}
            className="flex items-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            <Wrench className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add client tool</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-black border-gray-200 dark:border-gray-900">
              <DropdownMenuItem onClick={() => setSelectedType('client')} className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">
                <Wrench className="h-4 w-4 mr-2 text-primary" />
                Client
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('webhook')} className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">
                <Webhook className="h-4 w-4 mr-2 text-primary" />
                Webhook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('system')} className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">
                <Target className="h-4 w-4 mr-2 text-primary" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Empty State - Basic */}
        <Card className="border-gray-200 dark:border-gray-900">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 mb-4">
              <Wrench className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No integrations found</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
              You don&apos;t have any integrations yet. Add your first integration to get started.
            </p>
          </CardContent>
        </Card>
          </>
        )}

        {/* Advanced Mode */}
        {mode === 'advanced' && (
          <>
            {/* Advanced Settings View */}
            <Card className="border-gray-200 dark:border-gray-900">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20 mb-2">
                    <Code className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Mode</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                    Access advanced configuration options, custom webhooks, API integrations, and detailed logging.
                  </p>
                  <div className="pt-4">
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30">
                      <Code className="h-4 w-4" />
                      Configure Advanced Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Add Webhook Tool Dialog */}
      <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
              <Webhook className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              Add webhook tool
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Configuration Section */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Configuration</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Describe to the LLM how and when to use the tool.
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Name</label>
              <Input
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="w-full focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Description</label>
              <textarea
                value={toolDescription}
                onChange={(e) => setToolDescription(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-primary dark:focus:border-primary resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>

            {/* Method and URL */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2 col-span-1">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Method</label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">URL</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className="w-full focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Response Timeout */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Response timeout (seconds)
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                How long to wait for the client tool to respond before timing out. Default is 20 seconds.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={timeout}
                  onChange={(e) => setTimeout(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                  {timeout}s
                </span>
              </div>
            </div>

            {/* Disable Interruptions */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="disable-interruptions"
                checked={disableInterruptions}
                onChange={(e) => setDisableInterruptions(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary dark:focus:ring-primary"
              />
              <label htmlFor="disable-interruptions" className="text-sm text-gray-900 dark:text-white">
                Disable Interruptions
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-900">
            <Button variant="ghost" className="gap-2">
              <Code className="h-4 w-4" />
              Edit as JSON
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setWebhookDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30"
                onClick={() => {
                  console.log('Adding webhook tool:', {
                    name: toolName,
                    description: toolDescription,
                    method,
                    url,
                    timeout,
                    disableInterruptions
                  })
                  setWebhookDialogOpen(false)
                }}
              >
                Add tool
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Client Tool Dialog */}
      <Dialog open={clientToolDialogOpen} onOpenChange={setClientToolDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
              <Wrench className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              Add client tool
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Configuration Section */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Configuration</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Describe to the LLM how and when to use the tool.
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Name</label>
              <Input
                value={clientToolName}
                onChange={(e) => setClientToolName(e.target.value)}
                className="w-full focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Description</label>
              <textarea
                value={clientToolDescription}
                onChange={(e) => setClientToolDescription(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-primary dark:focus:border-primary resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>

            {/* Wait for response */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="wait-for-response"
                  checked={waitForResponse}
                  onChange={(e) => setWaitForResponse(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary dark:focus:ring-primary"
                />
                <div className="flex-1">
                  <label htmlFor="wait-for-response" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                    Wait for response
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Select this box to make the agent wait for the tool to finish executing before resuming the conversation.
                  </p>
                </div>
              </div>
            </div>

            {/* Disable Interruptions */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="client-disable-interruptions"
                  checked={clientDisableInterruptions}
                  onChange={(e) => setClientDisableInterruptions(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary dark:focus:ring-primary"
                />
                <div className="flex-1">
                  <label htmlFor="client-disable-interruptions" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                    Disable interruptions
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Select this box to disable interruptions while the tool is running.
                  </p>
                </div>
              </div>
            </div>

            {/* Pre-tool speech */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Pre-tool speech</label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Force agent speech before tool execution or let it decide automatically based on necessity and context cues.
              </p>
              <Select value={preToolSpeech} onValueChange={setPreToolSpeech}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto">Auto</SelectItem>
                  <SelectItem value="Always">Always</SelectItem>
                  <SelectItem value="Never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-900">
            <Button variant="ghost" className="gap-2">
              <Code className="h-4 w-4" />
              Edit as JSON
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setClientToolDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30"
                onClick={() => {
                  console.log('Adding client tool:', {
                    name: clientToolName,
                    description: clientToolDescription,
                    waitForResponse,
                    disableInterruptions: clientDisableInterruptions,
                    preToolSpeech
                  })
                  setClientToolDialogOpen(false)
                }}
              >
                Add tool
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}

