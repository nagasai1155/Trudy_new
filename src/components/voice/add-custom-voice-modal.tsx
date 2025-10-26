'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Upload, Cloud } from 'lucide-react'

interface AddCustomVoiceModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddCustomVoiceModal({ isOpen, onClose }: AddCustomVoiceModalProps) {
  const [activeTab, setActiveTab] = useState('voice-clone')
  const [voiceName, setVoiceName] = useState('')
  const [hasAgreed, setHasAgreed] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('')

  const handleSave = () => {
    console.log('Saving voice:', { voiceName, activeTab, selectedProvider })
    onClose()
    // Reset form
    setVoiceName('')
    setHasAgreed(false)
    setSelectedProvider('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white dark:bg-black border-gray-200 dark:border-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Custom Voice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Voice Source Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('voice-clone')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'voice-clone'
                  ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Voice Clone
            </button>
            <button
              onClick={() => setActiveTab('community-voices')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'community-voices'
                  ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Community Voices
            </button>
          </div>

          {/* Voice Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Voice Name</label>
            <Input
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              placeholder="Enter a voice name"
              className="w-full"
            />
          </div>

          {/* Upload Audio Clip Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Upload audio clip</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-full">
                  <Upload className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Choose a file or drag & drop it here
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Audio and video formats, up to 10 MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Provider Selection (for Community Voices tab) */}
          {activeTab === 'community-voices' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Select Provider</label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setSelectedProvider('elevenlabs')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedProvider === 'elevenlabs'
                      ? 'border-primary bg-primary/10 dark:bg-primary/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                      <span className="text-white dark:text-black text-xs font-bold">E</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">ElevenLabs</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">High-quality AI voices</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedProvider('google-cartesia')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedProvider === 'google-cartesia'
                      ? 'border-primary bg-primary/10 dark:bg-primary/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Google Cartesia</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Advanced voice synthesis</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedProvider('lmnt')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedProvider === 'lmnt'
                      ? 'border-primary bg-primary/10 dark:bg-primary/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">L</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">LMNT</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Real-time voice generation</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agreement"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary border-gray-300 dark:border-gray-700 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="agreement" className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              I hereby confirm that I have all necessary rights or consents to upload and clone these voice samples and that I will not use the platform-generated content for any illegal, fraudulent, or harmful purpose.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!voiceName || !hasAgreed || (activeTab === 'community-voices' && !selectedProvider)}
              className="bg-gray-600 dark:bg-gray-300 hover:bg-gray-700 dark:hover:bg-gray-400 text-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
