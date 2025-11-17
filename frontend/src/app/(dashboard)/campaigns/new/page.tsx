'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Upload, Table2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NewCampaignPage() {
  const router = useRouter()
  const [batchName, setBatchName] = useState('Untitled Batch')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-gray-200 dark:border-gray-900">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push('/campaigns')}
            className="rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create a batch call</h1>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 py-6 overflow-hidden">
          {/* Left Form */}
          <div className="space-y-6 overflow-y-auto pr-4">
            {/* Batch Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">Batch name</Label>
              <Input
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">Phone Number</Label>
              <Select value={phoneNumber} onValueChange={setPhoneNumber}>
                <SelectTrigger>
                  <SelectValue placeholder="Please add a phone number to start batch calling" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+1234567890">+1 (234) 567-890</SelectItem>
                  <SelectItem value="+0987654321">+0 (987) 654-321</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Select Agent */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">Select Agent</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent1">Sales Agent</SelectItem>
                  <SelectItem value="agent2">Support Agent</SelectItem>
                  <SelectItem value="agent3">Survey Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">Recipients</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">25.0 MB</span>
                  <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900">
                    CSV
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900">
                    XLS
                  </Badge>
                </div>
              </div>

              <div className="border-2 border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
                <Button variant="outline">
                  Upload
                </Button>
              </div>

              {/* Formatting Info */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Formatting</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>
                    The <span className="font-mono text-gray-900 dark:text-white">phone_number</span> column is required. You can also pass certain{' '}
                    <span className="font-medium text-gray-900 dark:text-white">overrides</span>. Any other columns will be passed as dynamic variables.
                  </p>
                  <div className="mt-3 flex gap-4 text-xs">
                    <div>
                      <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">name</div>
                      <div className="space-y-0.5 text-gray-600 dark:text-gray-400">
                        <div>Nav</div>
                        <div>Avbay</div>
                        <div>Thor</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">phone_number</div>
                      <div className="space-y-0.5 text-gray-600 dark:text-gray-400">
                        <div>+818910042</div>
                        <div>+818910042</div>
                        <div>+818910042</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">language</div>
                      <div className="space-y-0.5 text-gray-600 dark:text-gray-400">
                        <div>en</div>
                        <div>pt</div>
                        <div>de</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Preview */}
          <div className="hidden lg:flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-800 mx-auto mb-4">
                <Table2 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No recipients yet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                Upload a CSV to start adding recipients to this batch call
              </p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-900">
          <Button variant="outline">
            Test call
          </Button>
          <Button className="bg-gray-400 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-600 text-white cursor-not-allowed" disabled>
            Submit a Batch Call
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}

