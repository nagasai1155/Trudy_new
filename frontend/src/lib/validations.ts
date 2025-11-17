import { z } from 'zod'

// Agent Validations
export const agentSettingsSchema = z.object({
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(500),
  topP: z.number().min(0).max(1).default(1),
  frequencyPenalty: z.number().min(0).max(2).default(0),
  presencePenalty: z.number().min(0).max(2).default(0),
  endCallPhrases: z.array(z.string()).default([]),
  maxCallDuration: z.number().min(30).max(3600).default(600),
  voicemailDetection: z.boolean().default(true),
  recordCalls: z.boolean().default(true),
})

export const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(5000),
  voiceId: z.string().min(1, 'Voice selection is required'),
  settings: agentSettingsSchema.partial().optional(),
})

export const updateAgentSchema = createAgentSchema.partial().extend({
  status: z.enum(['draft', 'active', 'inactive', 'testing']).optional(),
})

// Voice Validations
export const voiceSettingsSchema = z.object({
  stability: z.number().min(0).max(1).optional(),
  similarityBoost: z.number().min(0).max(1).optional(),
  style: z.number().min(0).max(1).optional(),
  useSpeakerBoost: z.boolean().optional(),
})

export const createVoiceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  provider: z.enum(['elevenlabs', 'ultravox', 'custom']),
  voiceId: z.string().min(1),
  language: z.string().min(2).max(10),
  gender: z.enum(['male', 'female', 'neutral']).optional(),
  settings: voiceSettingsSchema.optional(),
})

// Knowledge Base Validations
export const createKnowledgeBaseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['text', 'file', 'url', 'api']),
  content: z.string().min(1, 'Content is required'),
  fileUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
})

// Tool Validations
export const toolConfigSchema = z.object({
  endpoint: z.string().url().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional(),
  headers: z.record(z.string()).optional(),
  params: z.record(z.any()).optional(),
  authentication: z.object({
    type: z.enum(['bearer', 'basic', 'apikey']),
    credentials: z.string(),
  }).optional(),
})

export const createToolSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(10, 'Description is required').max(500),
  type: z.enum(['api', 'webhook', 'function', 'database']),
  config: toolConfigSchema,
  enabled: z.boolean().default(true),
})

// Campaign Validations
export const contactSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  email: z.string().email('Invalid email').optional(),
  customFields: z.record(z.any()).optional(),
})

export const campaignScheduleSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  timezone: z.string().min(1),
  workingHours: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }),
  workingDays: z.array(z.number().min(0).max(6)),
  retryAttempts: z.number().min(0).max(10).default(3),
  retryDelay: z.number().min(1).max(1440).default(30),
})

export const campaignSettingsSchema = z.object({
  maxConcurrentCalls: z.number().min(1).max(100).default(10),
  callTimeout: z.number().min(30).max(300).default(60),
  leaveVoicemail: z.boolean().default(false),
  voicemailMessage: z.string().max(500).optional(),
  transferNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  customGreeting: z.string().max(500).optional(),
})

const campaignBaseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  agentId: z.string().min(1, 'Agent selection is required'),
  contacts: z.array(contactSchema).min(1, 'At least one contact is required'),
  schedule: campaignScheduleSchema,
  settings: campaignSettingsSchema,
})

export const createCampaignSchema = campaignBaseSchema.refine(
  (data) => {
    if (data.schedule.endDate) {
      return data.schedule.endDate > data.schedule.startDate
    }
    return true
  },
  {
    message: 'End date must be after start date',
    path: ['schedule', 'endDate'],
  }
)

export const updateCampaignSchema = campaignBaseSchema.partial().extend({
  status: z.enum(['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled']).optional(),
})

// Voice Cloning Validations
export const voiceCloneSettingsSchema = z.object({
  language: z.string().min(2).max(10),
  gender: z.enum(['male', 'female', 'neutral']).optional(),
  age: z.enum(['young', 'middle_aged', 'old']).optional(),
  accent: z.string().max(50).optional(),
  style: z.string().max(50).optional(),
})

export const createVoiceCloneSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  settings: voiceCloneSettingsSchema,
})

// File Upload Validations
export const audioFileSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      file => ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a'].includes(file.type),
      'File must be an audio file (MP3, WAV, or M4A)'
    ),
})

export const csvFileSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      file => file.type === 'text/csv' || file.name.endsWith('.csv'),
      'File must be a CSV file'
    ),
})

// Workspace Validations
export const workspaceSettingsSchema = z.object({
  timezone: z.string().min(1),
  defaultVoice: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  customDomain: z.string().optional(),
})

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  settings: workspaceSettingsSchema.optional(),
})

// User Profile Validations
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  avatar: z.string().url().optional(),
})

// Login/Signup Validations
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signupSchema = loginSchema.extend({
  name: z.string().min(1, 'Name is required').max(100),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Analytics Validations
export const timeRangeSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
  period: z.enum(['day', 'week', 'month', 'year', 'custom']),
}).refine(
  (data) => data.end > data.start,
  {
    message: 'End date must be after start date',
    path: ['end'],
  }
)

// Export type inference helpers
export type CreateAgentInput = z.infer<typeof createAgentSchema>
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
export type CreateVoiceCloneInput = z.infer<typeof createVoiceCloneSchema>
export type ContactInput = z.infer<typeof contactSchema>

