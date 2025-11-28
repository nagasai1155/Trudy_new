// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'org_admin' | 'workspace_admin' | 'member';

// Workspace Types
export interface Workspace {
  id: string;
  name: string;
  organizationId: string;
  settings: WorkspaceSettings;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  timezone: string;
  defaultVoice?: string;
  webhookUrl?: string;
  customDomain?: string;
}

// Agent Types (matching backend schema)
export interface Agent {
  id: string;
  client_id: string;
  ultravox_agent_id?: string;
  name: string;
  description?: string;
  voice_id: string;
  system_prompt: string;
  model: string;
  tools: Array<{
    tool_id: string;
    ultravox_tool_id?: string;
    enabled: boolean;
    parameters?: Record<string, any>;
  }>;
  knowledge_bases: string[]; // Array of KB IDs
  status: AgentStatus;
  created_at: string;
  updated_at: string;
}

export type AgentStatus = 'creating' | 'active' | 'inactive' | 'failed';

export interface AgentSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  endCallPhrases: string[];
  maxCallDuration: number;
  voicemailDetection: boolean;
  recordCalls: boolean;
}

// Voice Types (matching backend schema)
export interface Voice {
  id: string;
  client_id: string;
  name: string;
  provider: string; // 'elevenlabs', 'google', 'aws', 'azure', 'openai'
  type: 'custom' | 'reference';
  language: string;
  status: VoiceStatus;
  training_info?: {
    progress?: number;
    started_at?: string;
    completed_at?: string;
    estimated_completion?: string;
  };
  provider_voice_id?: string; // ElevenLabs voice ID for external voices
  ultravox_voice_id?: string;
  created_at: string;
  updated_at: string;
}

export type VoiceStatus = 'training' | 'active' | 'failed';

export interface VoiceSettings {
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

// Knowledge Base Types (matching backend schema)
export interface KnowledgeBase {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  language: string;
  ultravox_corpus_id?: string;
  status: KnowledgeBaseStatus;
  created_at: string;
  updated_at: string;
  document_counts?: {
    total: number;
    indexed: number;
    processing: number;
    failed: number;
  };
}

export type KnowledgeBaseStatus = 'creating' | 'ready' | 'processing' | 'failed';

// Tool Types
export interface Tool {
  id: string;
  name: string;
  description: string;
  type: ToolType;
  config: ToolConfig;
  enabled: boolean;
}

export type ToolType = 'api' | 'webhook' | 'function' | 'database';

export interface ToolConfig {
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  authentication?: {
    type: 'bearer' | 'basic' | 'apikey';
    credentials: string;
  };
}

// Campaign Types (matching backend schema)
export interface Campaign {
  id: string;
  client_id: string;
  agent_id: string;
  name: string;
  schedule_type: 'immediate' | 'scheduled';
  scheduled_at?: string;
  timezone: string;
  max_concurrent_calls: number;
  status: CampaignStatus;
  stats?: CampaignStats;
  created_at: string;
  updated_at: string;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'failed' | 'cancelled';

export interface Contact {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  customFields?: Record<string, any>;
  status: ContactStatus;
  callAttempts: number;
  lastCallAt?: Date;
}

export type ContactStatus = 'pending' | 'calling' | 'completed' | 'failed' | 'skipped';

export interface CampaignSchedule {
  startDate: Date;
  endDate?: Date;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  retryAttempts: number;
  retryDelay: number; // minutes
}

export interface CampaignSettings {
  maxConcurrentCalls: number;
  callTimeout: number; // seconds
  leaveVoicemail: boolean;
  voicemailMessage?: string;
  transferNumber?: string;
  customGreeting?: string;
}

export interface CampaignStats {
  totalContacts: number;
  completed: number;
  successful: number;
  failed: number;
  pending: number;
  totalDuration: number; // seconds
  averageDuration: number; // seconds
  totalCost: number;
  averageCost: number;
}

// Call Types (matching backend schema)
export interface Call {
  id: string;
  client_id: string;
  agent_id: string;
  ultravox_call_id?: string;
  phone_number: string;
  direction: 'inbound' | 'outbound';
  status: CallStatus;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  cost_usd?: number;
  created_at: string;
}

export type CallStatus = 'queued' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'no_answer' | 'busy' | 'voicemail';

export interface CallRecording {
  url: string;
  duration: number;
  size: number;
}

export interface CallTranscript {
  speaker: 'agent' | 'contact';
  text: string;
  timestamp: number;
  confidence: number;
}

// Voice Cloning Types
export interface VoiceClone {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: VoiceCloneStatus;
  audioSamples: AudioSample[];
  settings: VoiceCloneSettings;
  trainingProgress?: number;
  voiceId?: string;
  sampleUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type VoiceCloneStatus = 'draft' | 'training' | 'ready' | 'failed';

export interface AudioSample {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: number;
  uploadedAt: Date;
}

export interface VoiceCloneSettings {
  language: string;
  gender?: 'male' | 'female' | 'neutral';
  age?: 'young' | 'middle_aged' | 'old';
  accent?: string;
  style?: string;
}

// Analytics Types
export interface Analytics {
  overview: OverviewStats;
  calls: CallAnalytics;
  campaigns: CampaignAnalytics;
  agents: AgentAnalytics;
  costs: CostAnalytics;
  timeRange: TimeRange;
}

export interface OverviewStats {
  totalCalls: number;
  totalMinutes: number;
  totalCost: number;
  successRate: number;
  averageCallDuration: number;
  activeCampaigns: number;
  activeAgents: number;
  creditsRemaining: number;
}

export interface CallAnalytics {
  byStatus: Record<CallStatus, number>;
  byHour: Array<{ hour: number; count: number }>;
  byDay: Array<{ date: string; count: number }>;
  averageDuration: number;
  successRate: number;
}

export interface CampaignAnalytics {
  topPerforming: Array<{ campaignId: string; name: string; stats: CampaignStats }>;
  completion: number;
  activeCount: number;
}

export interface AgentAnalytics {
  byAgent: Array<{ agentId: string; name: string; callCount: number; successRate: number }>;
  averageResponseTime: number;
}

export interface CostAnalytics {
  byDay: Array<{ date: string; cost: number }>;
  byAgent: Array<{ agentId: string; name: string; cost: number }>;
  byCampaign: Array<{ campaignId: string; name: string; cost: number }>;
  projectedMonthlyCost: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
  period: 'day' | 'week' | 'month' | 'year' | 'custom';
}

// API Response Types (matching backend format)
// Note: Backend uses {data, meta} format - see lib/api.ts for BackendResponse
export interface ApiResponse<T> {
  data: T;
  meta?: {
    request_id?: string;
    ts?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types (matching backend schema)
export interface CreateAgentData {
  name: string;
  description?: string;
  voice_id: string;
  system_prompt: string;
  model?: string; // Default: 'fixie-ai/ultravox-v0_4-8k'
  tools?: Array<{
    tool_id: string;
    enabled?: boolean;
    parameters?: Record<string, any>;
  }>;
  knowledge_bases?: string[];
}

export interface UpdateAgentData {
  name?: string;
  description?: string;
  system_prompt?: string;
  voice_id?: string;
  tools?: Array<{
    tool_id: string;
    enabled?: boolean;
    parameters?: Record<string, any>;
  }>;
  knowledge_bases?: string[];
}

export interface CreateCampaignData {
  name: string;
  agent_id: string;
  schedule_type: 'immediate' | 'scheduled';
  scheduled_at?: string;
  timezone?: string; // Default: 'UTC'
  max_concurrent_calls?: number; // Default: 10
}

export interface UpdateCampaignData {
  name?: string;
  agent_id?: string;
  schedule_type?: 'immediate' | 'scheduled';
  scheduled_at?: string;
  timezone?: string;
  max_concurrent_calls?: number;
}

export interface CampaignContact {
  phone_number: string; // E.164 format: +12125550123
  first_name?: string;
  last_name?: string;
  email?: string;
  custom_fields?: Record<string, any>;
}

export interface CampaignContactsUpload {
  s3_key?: string;
  contacts?: CampaignContact[];
}

export interface CreateVoiceCloneData {
  name: string;
  description?: string;
  settings: VoiceCloneSettings;
}

// Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, any>;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

