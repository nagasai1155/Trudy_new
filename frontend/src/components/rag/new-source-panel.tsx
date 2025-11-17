'use client'

import { useState } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface NewSourcePanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NewSourcePanel({ isOpen, onClose }: NewSourcePanelProps) {
  const [sourceType, setSourceType] = useState<'web' | 'document'>('web')
  const [collection, setCollection] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSave = () => {
    // Handle save logic here
    console.log({ collection, name, description, sourceType })
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/80 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-[400px] bg-gray-50 dark:bg-black shadow-2xl z-50 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-900 bg-white dark:bg-black">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Source</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Collection */}
              <div className="space-y-2">
                <Label htmlFor="collection" className="text-sm font-medium text-gray-900 dark:text-white">
                  Collection<span className="text-red-500">*</span>
                </Label>
                <Select value={collection} onValueChange={setCollection}>
                  <SelectTrigger id="collection" className="bg-white dark:bg-black border-gray-300 dark:border-gray-800">
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collection1">Collection 1</SelectItem>
                    <SelectItem value="collection2">Collection 2</SelectItem>
                    <SelectItem value="collection3">Collection 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-900 dark:text-white">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Employee Handbook"
                  className="bg-white dark:bg-black border-gray-300 dark:border-gray-800"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-900 dark:text-white">
                  Description <span className="text-gray-500 dark:text-gray-500 font-normal">(Optional)</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Hours, services, and contact information can be found here."
                  rows={4}
                  className="bg-white dark:bg-black border-gray-300 dark:border-gray-800 resize-none"
                />
              </div>

              {/* Source Type Tabs */}
              <div className="space-y-3">
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => setSourceType('web')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium transition-colors border-b-2',
                      sourceType === 'web'
                        ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    )}
                  >
                    Web
                  </button>
                  <button
                    onClick={() => setSourceType('document')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium transition-colors border-b-2',
                      sourceType === 'document'
                        ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    )}
                  >
                    Document
                  </button>
                </div>

                {/* Source Type Content */}
                <div className="pt-2">
                  {sourceType === 'web' ? (
                    <div className="space-y-2">
                      <Label htmlFor="url" className="text-sm font-medium text-gray-900 dark:text-white">
                        URL
                      </Label>
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com"
                        className="bg-white dark:bg-black border-gray-300 dark:border-gray-800"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="file" className="text-sm font-medium text-gray-900 dark:text-white">
                        Upload Document
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer bg-white dark:bg-black">
                        <Input
                          id="file"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                        />
                        <label htmlFor="file" className="cursor-pointer">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            PDF, DOC, DOCX, TXT (max. 10MB)
                          </p>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-900 bg-white dark:bg-black">
            <Button
              onClick={handleSave}
              className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-medium"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

