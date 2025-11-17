'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createAgentSchema, type CreateAgentInput } from '@/lib/validations'
import { VOICE_PROVIDERS, LANGUAGES, DEFAULT_AGENT_SETTINGS } from '@/constants'
import { useCreateAgent } from '@/hooks/use-agents'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface AgentFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function AgentForm({ onSuccess, onCancel }: AgentFormProps) {
  const { toast } = useToast()
  const createAgent = useCreateAgent()
  const [settings, setSettings] = useState(DEFAULT_AGENT_SETTINGS)
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const form = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: '',
      description: '',
      prompt: '',
      voiceId: '',
    },
  })

  const onSubmit = async (data: CreateAgentInput) => {
    setIsSubmitting(true)
    
    startTransition(async () => {
      try {
        await createAgent.mutateAsync({
          ...data,
          settings,
        })
        
        // Show success state
        setShowSuccess(true)
        
        toast({
          title: 'Success',
          description: 'Agent created successfully',
        })
        
        // Wait a moment to show the success state before calling onSuccess
        setTimeout(() => {
          setIsSubmitting(false)
          setShowSuccess(false)
          onSuccess?.()
        }, 1000)
      } catch (error) {
        setIsSubmitting(false)
        toast({
          title: 'Error',
          description: 'Failed to create agent',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Agent Name</Label>
          <Input
            id="name"
            placeholder="e.g., Sales Agent"
            {...form.register('name')}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what this agent does..."
            {...form.register('description')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">System Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="You are a helpful AI assistant..."
            className="min-h-[200px]"
            {...form.register('prompt')}
          />
          {form.formState.errors.prompt && (
            <p className="text-sm text-destructive">
              {form.formState.errors.prompt.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="voiceId">Voice</Label>
          <Select
            onValueChange={(value) => form.setValue('voiceId', value)}
            value={form.watch('voiceId')}
          >
            <SelectTrigger id="voiceId">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {VOICE_PROVIDERS.map((provider) => (
                <SelectItem key={provider.value} value={provider.value}>
                  {provider.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.voiceId && (
            <p className="text-sm text-destructive">
              {form.formState.errors.voiceId.message}
            </p>
          )}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Advanced Settings</h3>
        
        <div className="space-y-2">
          <Label htmlFor="temperature">
            Temperature: {settings.temperature}
          </Label>
          <input
            type="range"
            id="temperature"
            min="0"
            max="2"
            step="0.1"
            value={settings.temperature}
            onChange={(e) =>
              setSettings({ ...settings, temperature: parseFloat(e.target.value) })
            }
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxTokens">Max Tokens</Label>
          <Input
            id="maxTokens"
            type="number"
            min="1"
            max="4000"
            value={settings.maxTokens}
            onChange={(e) =>
              setSettings({ ...settings, maxTokens: parseInt(e.target.value) })
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="transition-all duration-200"
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="transition-all duration-200 active:scale-95 min-w-[140px]"
        >
          {showSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4 animate-in zoom-in duration-300" />
              Created!
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Agent'
          )}
        </Button>
      </div>
    </form>
  )
}

