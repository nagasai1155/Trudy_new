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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Phone, Loader2 } from 'lucide-react'
import { Agent } from '@/types'

interface CreateCallModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateCall: (data: { agent_id: string; phone_number: string; direction: 'inbound' | 'outbound' }) => void
  agents: Agent[]
  isLoading: boolean
}

export function CreateCallModal({ isOpen, onClose, onCreateCall, agents, isLoading }: CreateCallModalProps) {
  const [agentId, setAgentId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [direction, setDirection] = useState<'inbound' | 'outbound'>('outbound')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agentId || !phoneNumber.trim()) {
      return
    }
    onCreateCall({
      agent_id: agentId,
      phone_number: phoneNumber.trim(),
      direction,
    })
  }

  const handleClose = () => {
    setAgentId('')
    setPhoneNumber('')
    setDirection('outbound')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white dark:bg-black border-gray-200 dark:border-gray-900">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Create New Call
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Agent Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Agent <span className="text-red-500">*</span>
            </label>
            <Select value={agentId} onValueChange={setAgentId} required disabled={agents.length === 0}>
              <SelectTrigger className="w-full bg-white dark:bg-black">
                <SelectValue placeholder={agents.length === 0 ? "No active agents available" : "Select an agent"} />
              </SelectTrigger>
              {agents.length > 0 && (
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              )}
            </Select>
            {agents.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Please create and activate an agent first.
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Enter phone number in E.164 format (e.g., +1234567890)
            </p>
          </div>

          {/* Direction */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Direction <span className="text-red-500">*</span>
            </label>
            <Select value={direction} onValueChange={(value) => setDirection(value as 'inbound' | 'outbound')}>
              <SelectTrigger className="w-full bg-white dark:bg-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outbound">Outbound (Agent calls contact)</SelectItem>
                <SelectItem value="inbound">Inbound (Contact calls agent)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!agentId || !phoneNumber.trim() || isLoading || agents.length === 0}
              className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Create Call
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

