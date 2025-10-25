'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCampaignSchema, type CreateCampaignInput } from '@/lib/validations'
import { TIMEZONES, DAYS_OF_WEEK } from '@/constants'
import { useCreateCampaign } from '@/hooks/use-campaigns'
import { useToast } from '@/hooks/use-toast'

interface CampaignFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CampaignForm({ onSuccess, onCancel }: CampaignFormProps) {
  const { toast } = useToast()
  const createCampaign = useCreateCampaign()
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5])

  const form = useForm<CreateCampaignInput>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      name: '',
      description: '',
      agentId: '',
      contacts: [],
      schedule: {
        startDate: new Date(),
        timezone: 'America/New_York',
        workingHours: {
          start: '09:00',
          end: '17:00',
        },
        workingDays: [1, 2, 3, 4, 5],
        retryAttempts: 3,
        retryDelay: 30,
      },
      settings: {
        maxConcurrentCalls: 10,
        callTimeout: 60,
        leaveVoicemail: false,
      },
    },
  })

  const onSubmit = async (data: CreateCampaignInput) => {
    try {
      await createCampaign.mutateAsync(data)
      toast({
        title: 'Success',
        description: 'Campaign created successfully',
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create campaign',
        variant: 'destructive',
      })
    }
  }

  const toggleWorkingDay = (day: number) => {
    const newDays = workingDays.includes(day)
      ? workingDays.filter(d => d !== day)
      : [...workingDays, day]
    setWorkingDays(newDays)
    form.setValue('schedule.workingDays', newDays)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Campaign Name</Label>
          <Input
            id="name"
            placeholder="e.g., Summer Outreach 2024"
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
            placeholder="Describe the purpose of this campaign..."
            {...form.register('description')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="agentId">Select Agent</Label>
          <Select
            onValueChange={(value) => form.setValue('agentId', value)}
            value={form.watch('agentId')}
          >
            <SelectTrigger id="agentId">
              <SelectValue placeholder="Choose an agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Sales Agent</SelectItem>
              <SelectItem value="2">Support Agent</SelectItem>
              <SelectItem value="3">Survey Agent</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.agentId && (
            <p className="text-sm text-destructive">
              {form.formState.errors.agentId.message}
            </p>
          )}
        </div>
      </div>

      {/* Schedule */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Schedule</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...form.register('schedule.startDate')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              onValueChange={(value) => form.setValue('schedule.timezone', value)}
              value={form.watch('schedule.timezone')}
            >
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Working Days</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <Button
                key={day.value}
                type="button"
                variant={workingDays.includes(day.value) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleWorkingDay(day.value)}
              >
                {day.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={createCampaign.isPending}>
          {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
        </Button>
      </div>
    </form>
  )
}

