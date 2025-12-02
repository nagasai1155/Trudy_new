'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Upload, Cloud, X, Loader2 } from 'lucide-react'
import { useCreateVoice } from '@/hooks/use-voices'
import { apiClient, endpoints } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface AddCustomVoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (voiceData: { name: string; source: 'voice-clone' | 'community-voices'; provider?: string }) => void
}

interface UploadedFile {
  file: File
  s3Key: string
  duration: number
  text: string
}

export function AddCustomVoiceModal({ isOpen, onClose, onSave }: AddCustomVoiceModalProps) {
  const [activeTab, setActiveTab] = useState('voice-clone')
  const [voiceName, setVoiceName] = useState('')
  const [hasAgreed, setHasAgreed] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('')
  const [providerVoiceId, setProviderVoiceId] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isProcessingRef = useRef(false) // Prevent multiple simultaneous calls
  const { toast } = useToast()
  const createVoiceMutation = useCreateVoice()

  // Get audio duration from file
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      const url = URL.createObjectURL(file)
      
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url)
        reject(new Error('Timeout loading audio metadata'))
      }, 10000)
      
      const cleanup = () => {
        clearTimeout(timeout)
        URL.revokeObjectURL(url)
      }
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration
        cleanup()
        if (duration && !isNaN(duration) && isFinite(duration)) {
          resolve(duration)
        } else {
          reject(new Error('Invalid audio duration'))
        }
      })
      
      audio.addEventListener('error', (e) => {
        cleanup()
        reject(new Error(`Failed to load audio: ${audio.error?.message || 'Unknown error'}`))
      })
      
      audio.src = url
      audio.load()
    })
  }

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const validFiles = Array.from(files).filter(file => {
      // Check file size first
      if (file.size === 0) {
        toast({
          title: 'Invalid file',
          description: `${file.name} is empty (0 bytes). Please select a valid audio file.`,
          variant: 'destructive',
        })
        return false
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} is ${(file.size / 1024 / 1024).toFixed(2)} MB. Maximum size is 10 MB.`,
          variant: 'destructive',
        })
        return false
      }

      // Check file extension (more reliable for downloaded files)
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      const validExtensions = ['.wav', '.mp3', '.mpeg', '.webm', '.ogg', '.m4a', '.aac', '.flac']
      
      // Check MIME type (may be empty for downloaded files)
      const validTypes = [
        'audio/wav', 'audio/wave', 'audio/x-wav',
        'audio/mpeg', 'audio/mp3', 'audio/mpeg3',
        'audio/webm', 'audio/ogg', 'audio/vorbis',
        'audio/mp4', 'audio/m4a', 'audio/aac',
        'audio/flac', 'audio/x-flac'
      ]
      
      // Accept if extension is valid OR MIME type is valid OR MIME type is empty (downloaded files often have empty type)
      const isValid = validExtensions.includes(extension) || 
             validTypes.includes(file.type) || 
             (file.type === '' && validExtensions.includes(extension))
      
      if (!isValid) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a supported audio format. Please use WAV, MP3, WebM, OGG, M4A, AAC, or FLAC.`,
          variant: 'destructive',
        })
      }
      
      return isValid
    })

    if (validFiles.length === 0) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload audio files (WAV, MP3, WebM, OGG)',
        variant: 'destructive',
      })
      return
    }

    if (validFiles.length > 10) {
      toast({
        title: 'Too many files',
        description: 'Please upload maximum 10 files',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    try {
      // Get presigned URLs
      const presignResponse = await apiClient.post<{ uploads: Array<{ doc_id: string; s3_key: string; url: string; headers: Record<string, string> }> }>(
        endpoints.voices.presign,
        {
          files: validFiles.map(file => {
            // Determine content type from file extension if MIME type is missing
            const extension = '.' + file.name.split('.').pop()?.toLowerCase()
            const extensionToMime: Record<string, string> = {
              '.wav': 'audio/wav',
              '.mp3': 'audio/mpeg',
              '.mpeg': 'audio/mpeg',
              '.webm': 'audio/webm',
              '.ogg': 'audio/ogg',
              '.m4a': 'audio/mp4',
              '.aac': 'audio/aac',
              '.flac': 'audio/flac',
            }
            
            return {
              filename: file.name,
              content_type: file.type || extensionToMime[extension] || 'audio/wav',
              file_size: file.size,
            }
          }),
        }
      )

      const uploads = presignResponse.data.uploads

      if (!uploads || uploads.length !== validFiles.length) {
        throw new Error(`Mismatch: received ${uploads?.length || 0} presigned URLs for ${validFiles.length} files`)
      }

      // Upload files to S3 and get durations
      const uploaded: UploadedFile[] = []
      const uploadErrors: string[] = []
      
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        const upload = uploads[i]

        try {
          const contentType = file.type || upload.headers['Content-Type'] || 'audio/wav'
          
          if (!upload.url || typeof upload.url !== 'string' || !upload.url.startsWith('http')) {
            throw new Error(`Invalid presigned URL received for ${file.name}. Please try again.`)
          }

          // For downloaded files, read as ArrayBuffer
          let uploadBody: Blob | ArrayBuffer
          try {
            uploadBody = await file.arrayBuffer()
          } catch (error) {
            uploadBody = file
          }

          // Upload to S3
          let uploadResponse: Response
          try {
            uploadResponse = await fetch(upload.url, {
              method: 'PUT',
              headers: {
                'Content-Type': contentType,
              },
              body: uploadBody,
              mode: 'cors',
              credentials: 'omit',
              cache: 'no-cache',
            })
          } catch (fetchError) {
            if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
              throw new Error(`Network error: Unable to connect to S3. This is usually a CORS configuration issue. Please ensure the S3 bucket has CORS enabled for your domain.`)
            }
            throw fetchError
          }

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text().catch(() => 'Unknown error')
            throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
          }

          // Get audio duration
          let duration = 0
          try {
            duration = await getAudioDuration(file)
          } catch (error) {
            const estimatedDuration = Math.max(5, Math.round((file.size / 1024 / 1024) * 60))
            duration = estimatedDuration
          }

          const s3Key = upload.s3_key

          uploaded.push({
            file,
            s3Key,
            duration,
            text: `Sample ${i + 1}`,
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed'
          uploadErrors.push(`${file.name}: ${errorMessage}`)
        }
      }

      if (uploadErrors.length > 0) {
        toast({
          title: 'Some files failed to upload',
          description: uploadErrors.join(', '),
          variant: 'destructive',
        })
      }

      if (uploaded.length === 0) {
        throw new Error('All files failed to upload')
      }

      setUploadedFiles(prev => [...prev, ...uploaded])
      
      if (uploaded.length > 0) {
        toast({
          title: 'Files uploaded',
          description: `Successfully uploaded ${uploaded.length} file(s)${uploadErrors.length > 0 ? ` (${uploadErrors.length} failed)` : ''}`,
        })
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload files',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }, [toast])

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Update sample text
  const updateSampleText = (index: number, text: string) => {
    setUploadedFiles(prev => prev.map((file, i) => i === index ? { ...file, text } : file))
  }

  // Handle save/create voice
  const handleSave = async () => {
    // Prevent multiple simultaneous calls
    if (isCreating || isUploading || isProcessingRef.current) {
      return
    }

    if (!voiceName || !hasAgreed) {
      return
    }

    // Set processing flag
    isProcessingRef.current = true

    // For community voices (external), create voice directly with provider_voice_id
    if (activeTab === 'community-voices') {
      if (!selectedProvider) {
        toast({
          title: 'Provider required',
          description: 'Please select a provider',
          variant: 'destructive',
        })
        return
      }

      // For ElevenLabs, provider_voice_id is required
      if (selectedProvider === 'elevenlabs' && !providerVoiceId.trim()) {
        toast({
          title: 'Voice ID required',
          description: 'Please enter the ElevenLabs voice ID (e.g., pNInz6obpgDQGcFmaJgB)',
          variant: 'destructive',
        })
        return
      }

      setIsCreating(true)
      try {
        await createVoiceMutation.mutateAsync({
          name: voiceName,
          strategy: 'external',
          source: {
            type: 'external',
            provider_voice_id: providerVoiceId.trim() || undefined,
          },
          provider_overrides: {
            provider: selectedProvider,
          },
        })

        toast({
          title: 'Voice created',
          description: `"${voiceName}" has been created successfully.`,
        })

        if (onSave) {
          onSave({
            name: voiceName,
            source: 'community-voices',
            provider: selectedProvider,
          })
        }

        resetForm()
      } catch (error) {
        toast({
          title: 'Error creating voice',
          description: error instanceof Error ? error.message : 'Failed to create voice',
          variant: 'destructive',
        })
      } finally {
        setIsCreating(false)
        isProcessingRef.current = false
      }
      return
    }

    // For voice clone (native), need to create voice with uploaded files
    if (activeTab === 'voice-clone') {
      if (uploadedFiles.length === 0) {
        isProcessingRef.current = false
        toast({
          title: 'Files required',
          description: 'Please upload at least one audio file for voice cloning',
          variant: 'destructive',
        })
        return
      }

      setIsCreating(true)
      try {
        await createVoiceMutation.mutateAsync({
          name: voiceName,
          strategy: 'native',
          source: {
            type: 'native',
            samples: uploadedFiles.map(file => ({
              text: file.text,
              s3_key: file.s3Key,
              duration_seconds: file.duration,
            })),
          },
          provider_overrides: {
            provider: 'elevenlabs',
          },
        })

        toast({
          title: 'Voice created',
          description: `"${voiceName}" is being trained. This may take a few minutes.`,
        })

        if (onSave) {
          onSave({
            name: voiceName,
            source: 'voice-clone',
          })
        }

        resetForm()
      } catch (error) {
        toast({
          title: 'Error creating voice',
          description: error instanceof Error ? error.message : 'Failed to create voice',
          variant: 'destructive',
        })
      } finally {
        setIsCreating(false)
        isProcessingRef.current = false
      }
    }
  }

  const resetForm = () => {
    setVoiceName('')
    setHasAgreed(false)
    setSelectedProvider('')
    setProviderVoiceId('')
    setUploadedFiles([])
    isProcessingRef.current = false
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full bg-white dark:bg-black border-gray-200 dark:border-gray-900 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Add Custom Voice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-5 py-2 sm:py-4">
          {/* Voice Source Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('voice-clone')}
              className={`flex-1 py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                activeTab === 'voice-clone'
                  ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Voice Clone
            </button>
            <button
              onClick={() => setActiveTab('community-voices')}
              className={`flex-1 py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                activeTab === 'community-voices'
                  ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Community Voices
            </button>
          </div>

          {/* Voice Name Input */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Voice Name</label>
            <Input
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              placeholder="Enter a voice name"
              className="w-full text-sm"
            />
          </div>

          {/* Upload Audio Clip Section - Only show for voice-clone tab */}
          {activeTab === 'voice-clone' && (
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Upload audio clips</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.wav,.mp3,.mpeg,.webm,.ogg"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isUploading}
              />
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-400 animate-spin" />
                  ) : (
                    <div className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-900 rounded-full">
                      <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {isUploading ? 'Uploading...' : 'Choose files or drag & drop here'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Audio formats (WAV, MP3, WebM, OGG), up to 10 MB each, max 10 files
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 mt-3">
                  {uploadedFiles.map((uploadedFile, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round(uploadedFile.duration)}s
                        </p>
                      </div>
                      <Input
                        type="text"
                        placeholder="Sample text (optional)"
                        value={uploadedFile.text}
                        onChange={(e) => updateSampleText(index, e.target.value)}
                        className="flex-1 text-xs h-8"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Provider Selection (for Community Voices tab) */}
          {activeTab === 'community-voices' && (
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Select Provider</label>
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                <button
                  onClick={() => setSelectedProvider('elevenlabs')}
                  className={`p-3 sm:p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedProvider === 'elevenlabs'
                      ? 'border-primary bg-primary/10 dark:bg-primary/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white dark:text-black text-xs font-bold">E</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">ElevenLabs</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">High-quality AI voices</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedProvider('google-cartesia')}
                  className={`p-3 sm:p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedProvider === 'google-cartesia'
                      ? 'border-primary bg-primary/10 dark:bg-primary/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Google Cartesia</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Advanced voice synthesis</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedProvider('lmnt')}
                  className={`p-3 sm:p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedProvider === 'lmnt'
                      ? 'border-primary bg-primary/10 dark:bg-primary/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">L</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">LMNT</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Real-time voice generation</p>
                    </div>
                  </div>
                </button>
              </div>
              
              {/* Provider Voice ID Input (for ElevenLabs) */}
              {selectedProvider === 'elevenlabs' && (
                <div className="space-y-1.5 sm:space-y-2 mt-3">
                  <label className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    ElevenLabs Voice ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={providerVoiceId}
                    onChange={(e) => setProviderVoiceId(e.target.value)}
                    placeholder="e.g., pNInz6obpgDQGcFmaJgB or Adam"
                    className="w-full text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Enter the ElevenLabs voice ID. You can find this in your ElevenLabs dashboard.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="flex items-start space-x-2 sm:space-x-3">
            <input
              type="checkbox"
              id="agreement"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-0.5 sm:mt-1 h-4 w-4 text-primary border-gray-300 dark:border-gray-700 rounded focus:ring-primary dark:focus:ring-primary flex-shrink-0"
            />
            <label htmlFor="agreement" className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              I hereby confirm that I have all necessary rights or consents to upload and clone these voice samples and that I will not use the platform-generated content for any illegal, fraudulent, or harmful purpose.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-0 pt-2 sm:pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-800 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !voiceName || 
                !hasAgreed || 
                isUploading || 
                isCreating ||
                (activeTab === 'community-voices' && (!selectedProvider || (selectedProvider === 'elevenlabs' && !providerVoiceId.trim()))) ||
                (activeTab === 'voice-clone' && uploadedFiles.length === 0)
              }
              className="w-full sm:w-auto bg-gray-600 dark:bg-gray-300 hover:bg-gray-700 dark:hover:bg-gray-400 text-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
