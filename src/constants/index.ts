// Voice Providers
export const VOICE_PROVIDERS = [
  { value: 'elevenlabs', label: 'ElevenLabs' },
  { value: 'ultravox', label: 'UltraVox' },
  { value: 'custom', label: 'Custom Voice' },
] as const

// Languages
export const LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'es-MX', label: 'Spanish (Mexico)' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'it-IT', label: 'Italian' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'ko-KR', label: 'Korean' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
] as const

// Timezones
export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
] as const

// Days of Week
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const

// Agent Statuses
export const AGENT_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'inactive', label: 'Inactive', color: 'red' },
  { value: 'testing', label: 'Testing', color: 'blue' },
] as const

// Campaign Statuses
export const CAMPAIGN_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'running', label: 'Running', color: 'green' },
  { value: 'paused', label: 'Paused', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'purple' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const

// Call Statuses
export const CALL_STATUSES = [
  { value: 'queued', label: 'Queued', color: 'gray' },
  { value: 'ringing', label: 'Ringing', color: 'blue' },
  { value: 'in_progress', label: 'In Progress', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'purple' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'no_answer', label: 'No Answer', color: 'yellow' },
  { value: 'busy', label: 'Busy', color: 'orange' },
  { value: 'voicemail', label: 'Voicemail', color: 'indigo' },
] as const

// Voice Clone Statuses
export const VOICE_CLONE_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'training', label: 'Training', color: 'blue' },
  { value: 'ready', label: 'Ready', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
] as const

// Default Agent Settings
export const DEFAULT_AGENT_SETTINGS = {
  temperature: 0.7,
  maxTokens: 500,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  endCallPhrases: ['goodbye', 'thank you', 'bye'],
  maxCallDuration: 600,
  voicemailDetection: true,
  recordCalls: true,
}

// Default Campaign Settings
export const DEFAULT_CAMPAIGN_SETTINGS = {
  maxConcurrentCalls: 10,
  callTimeout: 60,
  leaveVoicemail: false,
  retryAttempts: 3,
  retryDelay: 30,
  workingHours: {
    start: '09:00',
    end: '17:00',
  },
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
}

// Chart Colors
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  gray: '#6b7280',
}

// File Upload Limits
export const UPLOAD_LIMITS = {
  audio: {
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedFormats: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a'],
  },
  csv: {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedFormats: ['text/csv'],
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedFormats: ['application/pdf', 'text/plain', 'application/msword'],
  },
}

// API Rate Limits
export const RATE_LIMITS = {
  calls: 100,
  agents: 50,
  campaigns: 20,
  voiceClones: 10,
}

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// Date Formats
export const DATE_FORMATS = {
  short: 'MMM dd, yyyy',
  long: 'MMMM dd, yyyy',
  time: 'HH:mm:ss',
  datetime: 'MMM dd, yyyy HH:mm',
}

// Navigation Items with Categories
export const NAV_ITEMS = [
  {
    title: 'Home',
    href: '/dashboard',
    icon: 'Home',
  },
  {
    category: 'Build',
  },
  {
    title: 'Agents',
    href: '/agents',
    icon: 'Wand2',
  },
  {
    title: 'Knowledge Base',
    href: '/rag',
    icon: 'FolderOpen',
  },
  {
    title: 'Integrations',
    href: '/tools',
    icon: 'Wrench',
  },
  {
    title: 'Voices',
    href: '/voice-cloning',
    icon: 'Mic',
  },
  {
    category: 'Evaluate',
  },
        {
          title: 'Calls',
          href: '/calls',
          icon: 'Phone',
        },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: 'BarChart3',
  },
  {
    category: 'Telephony',
  },
  {
    title: 'Phone Numbers',
    href: '/phone-numbers',
    icon: 'Smartphone',
  },
  {
    title: 'Outbound',
    href: '/campaigns',
    icon: 'PhoneOutgoing',
  },
  {
    category: 'Integrations',
  },
  {
    title: 'Contacts',
    href: '/contacts',
    icon: 'Users',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'Settings',
  },
] as const

// Quick Actions
export const QUICK_ACTIONS = [
  {
    title: 'Create Agent',
    description: 'Build a new AI voice agent',
    href: '/agents/new',
    icon: 'Bot',
    color: 'blue',
  },
  {
    title: 'Start Campaign',
    description: 'Launch a new calling campaign',
    href: '/campaigns/new',
    icon: 'Megaphone',
    color: 'purple',
  },
  {
    title: 'Clone Voice',
    description: 'Create a custom voice clone',
    href: '/voice-cloning/new',
    icon: 'Mic',
    color: 'green',
  },
  {
    title: 'Import Contacts',
    description: 'Upload a contact list',
    href: '/contacts/import',
    icon: 'Upload',
    color: 'orange',
  },
] as const

// Support Links
export const SUPPORT_LINKS = {
  documentation: 'https://docs.trudy.ai',
  support: 'https://support.trudy.ai',
  status: 'https://status.trudy.ai',
  community: 'https://community.trudy.ai',
}

// Social Links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/trudyai',
  linkedin: 'https://linkedin.com/company/trudyai',
  github: 'https://github.com/trudyai',
}

