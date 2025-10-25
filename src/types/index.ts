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

// Agent Types
export interface Agent {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  prompt: string;
  voice: Voice;
  knowledgeBase: KnowledgeBase[];
  tools: Tool[];
  settings: AgentSettings;
  status: AgentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type AgentStatus = 'draft' | 'active' | 'inactive' | 'testing';

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

// Voice Types
export interface Voice {
  id: string;
  name: string;
  provider: VoiceProvider;
  voiceId: string;
  language: string;
  gender?: 'male' | 'female' | 'neutral';
  isCustom: boolean;
  sampleUrl?: string;
  settings?: VoiceSettings;
}

export type VoiceProvider = 'elevenlabs' | 'ultravox' | 'custom';

export interface VoiceSettings {
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

// Knowledge Base Types
export interface KnowledgeBase {
  id: string;
  name: string;
  type: KnowledgeBaseType;
  content: string;
  fileUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type KnowledgeBaseType = 'text' | 'file' | 'url' | 'api';

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

// Campaign Types
export interface Campaign {
  id: string;
  workspaceId: string;
  agentId: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  contacts: Contact[];
  schedule: CampaignSchedule;
  settings: CampaignSettings;
  stats: CampaignStats;
  createdAt: Date;
  updatedAt: Date;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';

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

// Call Types
export interface Call {
  id: string;
  campaignId: string;
  contactId: string;
  agentId: string;
  phoneNumber: string;
  status: CallStatus;
  startedAt?: Date;
  endedAt?: Date;
  duration: number; // seconds
  cost: number;
  recording?: CallRecording;
  transcript?: CallTranscript[];
  metadata?: Record<string, any>;
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

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
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

// Form Types
export interface CreateAgentData {
  name: string;
  description?: string;
  prompt: string;
  voiceId: string;
  settings?: Partial<AgentSettings>;
}

export interface UpdateAgentData extends Partial<CreateAgentData> {
  status?: AgentStatus;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  agentId: string;
  contacts: Omit<Contact, 'id' | 'status' | 'callAttempts'>[];
  schedule: CampaignSchedule;
  settings: CampaignSettings;
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {
  status?: CampaignStatus;
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

