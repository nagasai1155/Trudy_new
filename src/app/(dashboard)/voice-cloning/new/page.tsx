'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { LANGUAGES } from '@/constants'

export default function NewVoiceClonePage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: 'en-US',
    gender: '',
  })

  const [audioFiles, setAudioFiles] = useState<string[]>([])

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/voice-cloning">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create Voice Clone</h1>
              <p className="text-muted-foreground">
                Upload audio samples to create a custom voice
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/voice-cloning">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Start Training
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Voice Information</CardTitle>
                <CardDescription>
                  Basic details about your voice clone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Voice Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., CEO Voice"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this voice..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audio Samples</CardTitle>
                <CardDescription>
                  Upload 5-10 minutes of clear audio for best results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Upload Audio Files</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag and drop audio files here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Supports: MP3, WAV, M4A (Max 10MB per file)
                  </p>
                  <Button variant="outline" className="mt-4">
                    Choose Files
                  </Button>
                </div>

                {audioFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files ({audioFiles.length})</Label>
                    <div className="space-y-2">
                      {audioFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <span className="text-sm">{file}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setAudioFiles(audioFiles.filter((_, i) => i !== index))
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-medium mb-2">Tips for best results:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Use clear, high-quality audio recordings</li>
                    <li>• Minimize background noise</li>
                    <li>• Include varied speech patterns and emotions</li>
                    <li>• Upload at least 5 minutes of audio</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

