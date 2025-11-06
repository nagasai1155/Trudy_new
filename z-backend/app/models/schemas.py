"""
Pydantic Models for Request/Response
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ============================================
# Enums
# ============================================

class VoiceStrategy(str, Enum):
    AUTO = "auto"
    NATIVE = "native"
    EXTERNAL = "external"


class VoiceType(str, Enum):
    CUSTOM = "custom"
    REFERENCE = "reference"


class VoiceStatus(str, Enum):
    TRAINING = "training"
    ACTIVE = "active"
    FAILED = "failed"


class CallDirection(str, Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"


class CallStatus(str, Enum):
    QUEUED = "queued"
    RINGING = "ringing"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class CampaignScheduleType(str, Enum):
    IMMEDIATE = "immediate"
    SCHEDULED = "scheduled"


class CampaignStatus(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"


# ============================================
# Common Models
# ============================================

class ResponseMeta(BaseModel):
    request_id: str
    ts: datetime


class ErrorResponse(BaseModel):
    error: Dict[str, Any]


# ============================================
# Auth Models
# ============================================

class UserResponse(BaseModel):
    id: str
    auth0_sub: str
    client_id: str
    email: str
    role: str
    created_at: datetime


class ClientResponse(BaseModel):
    id: str
    name: str
    email: str
    subscription_status: str
    credits_balance: int
    credits_ceiling: int
    created_at: datetime


class ApiKeyCreate(BaseModel):
    service: str = Field(..., description="Service name")
    key_name: str = Field(..., description="User-friendly name")
    api_key: str = Field(..., description="API key value")
    settings: Optional[Dict[str, Any]] = Field(default={})


class ApiKeyResponse(BaseModel):
    id: str
    client_id: str
    service: str
    key_name: str
    is_active: bool
    created_at: datetime


class TTSProviderUpdate(BaseModel):
    provider: str = Field(..., description="Provider: google, aws, azure, openai, elevenlabs")
    api_key: str = Field(..., description="Provider API key")
    voice_id: Optional[str] = None
    settings: Optional[Dict[str, Any]] = Field(default={})


# ============================================
# Voice Models
# ============================================

class VoiceSample(BaseModel):
    text: str
    s3_key: str
    duration_seconds: float = Field(..., ge=3.0, le=10.0)


class VoiceSource(BaseModel):
    type: str
    samples: Optional[List[VoiceSample]] = None
    provider_voice_id: Optional[str] = None


class VoiceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    strategy: VoiceStrategy
    source: VoiceSource
    provider_overrides: Optional[Dict[str, Any]] = None
    
    @validator("source")
    def validate_source(cls, v, values):
        if values.get("strategy") == VoiceStrategy.NATIVE:
            if not v.samples or len(v.samples) < 3:
                raise ValueError("Native voice requires at least 3 samples")
            total_duration = sum(s.duration_seconds for s in v.samples)
            if total_duration < 15.0:
                raise ValueError("Total sample duration must be at least 15 seconds")
        return v


class VoiceResponse(BaseModel):
    id: str
    client_id: str
    name: str
    provider: str
    type: str
    language: str
    status: str
    training_info: Optional[Dict[str, Any]] = None
    ultravox_voice_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class PresignFileRequest(BaseModel):
    filename: str
    content_type: str
    file_size: int


class PresignResponse(BaseModel):
    doc_id: str
    url: str
    headers: Dict[str, str]


class VoicePresignRequest(BaseModel):
    files: List[PresignFileRequest] = Field(..., min_items=1, max_items=10)


# ============================================
# Agent Models
# ============================================

class AgentTool(BaseModel):
    tool_id: str
    enabled: bool = True
    parameters: Optional[Dict[str, Any]] = None


class AgentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    voice_id: str
    system_prompt: str = Field(..., min_length=10, max_length=5000)
    model: str = Field(default="fixie-ai/ultravox-v0_4-8k")
    tools: Optional[List[AgentTool]] = Field(default=[])
    knowledge_bases: Optional[List[str]] = Field(default=[])


class AgentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    system_prompt: Optional[str] = Field(None, min_length=10, max_length=5000)
    voice_id: Optional[str] = None
    tools: Optional[List[AgentTool]] = None
    knowledge_bases: Optional[List[str]] = None


class AgentResponse(BaseModel):
    id: str
    client_id: str
    ultravox_agent_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    voice_id: str
    system_prompt: str
    model: str
    tools: List[Dict[str, Any]]
    knowledge_bases: List[str]
    status: str
    created_at: datetime
    updated_at: datetime


# ============================================
# Knowledge Base Models
# ============================================

class KnowledgeBaseCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    language: str = Field(default="en-US")


class KnowledgeBaseResponse(BaseModel):
    id: str
    client_id: str
    name: str
    description: Optional[str] = None
    language: str
    ultravox_corpus_id: Optional[str] = None
    status: str
    created_at: datetime


class KBFilePresignRequest(BaseModel):
    files: List[PresignFileRequest] = Field(..., min_items=1)


class KBFileIngestRequest(BaseModel):
    document_ids: List[str] = Field(..., min_items=1)


# ============================================
# Call Models
# ============================================

class CallSettings(BaseModel):
    recording_enabled: bool = True
    transcription_enabled: bool = True
    greeting: Optional[str] = None


class CallCreate(BaseModel):
    agent_id: str
    phone_number: str = Field(..., pattern=r"^\+[1-9]\d{1,14}$")
    direction: CallDirection
    call_settings: Optional[CallSettings] = None
    context: Optional[Dict[str, Any]] = None


class CallResponse(BaseModel):
    id: str
    client_id: str
    agent_id: str
    ultravox_call_id: Optional[str] = None
    phone_number: str
    direction: str
    status: str
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    cost_usd: Optional[float] = None
    created_at: datetime


class TranscriptResponse(BaseModel):
    call_id: str
    transcript: List[Dict[str, Any]]
    summary: Optional[str] = None


class RecordingResponse(BaseModel):
    call_id: str
    recording_url: str
    format: str
    duration_seconds: Optional[int] = None


# ============================================
# Campaign Models
# ============================================

class CampaignCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    agent_id: str
    schedule_type: CampaignScheduleType
    scheduled_at: Optional[datetime] = None
    timezone: str = Field(default="UTC")
    max_concurrent_calls: int = Field(default=10, ge=1, le=100)
    
    @validator("scheduled_at")
    def validate_scheduled_at(cls, v, values):
        if values.get("schedule_type") == CampaignScheduleType.SCHEDULED and not v:
            raise ValueError("scheduled_at is required for scheduled campaigns")
        return v


class CampaignContact(BaseModel):
    phone_number: str = Field(..., pattern=r"^\+[1-9]\d{1,14}$")
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = None


class CampaignContactsUpload(BaseModel):
    s3_key: Optional[str] = None
    contacts: Optional[List[CampaignContact]] = None
    
    @validator("s3_key", "contacts")
    def validate_upload_source(cls, v, values):
        if not values.get("s3_key") and not values.get("contacts"):
            raise ValueError("Either s3_key or contacts must be provided")
        return v


class CampaignUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    agent_id: Optional[str] = None
    schedule_type: Optional[CampaignScheduleType] = None
    scheduled_at: Optional[datetime] = None
    timezone: Optional[str] = None
    max_concurrent_calls: Optional[int] = Field(None, ge=1, le=100)


class CampaignResponse(BaseModel):
    id: str
    client_id: str
    agent_id: str
    name: str
    schedule_type: str
    scheduled_at: Optional[datetime] = None
    timezone: str
    max_concurrent_calls: int
    status: str
    ultravox_batch_ids: Optional[List[str]] = None
    stats: Dict[str, int]
    created_at: datetime
    updated_at: Optional[datetime] = None


# ============================================
# Webhook Models
# ============================================

class WebhookEndpointCreate(BaseModel):
    url: str = Field(..., pattern=r"^https://")
    event_types: List[str] = Field(..., min_items=1)
    secret: Optional[str] = None
    enabled: bool = True
    retry_config: Optional[Dict[str, Any]] = None


class WebhookEndpointUpdate(BaseModel):
    url: Optional[str] = Field(None, pattern=r"^https://")
    event_types: Optional[List[str]] = Field(None, min_items=1)
    enabled: Optional[bool] = None
    retry_config: Optional[Dict[str, Any]] = None


class WebhookEndpointResponse(BaseModel):
    id: str
    client_id: str
    url: str
    event_types: List[str]
    secret: Optional[str] = None  # Only returned on creation
    enabled: bool
    retry_config: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# ============================================
# Tool Models
# ============================================

class ToolCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    category: Optional[str] = None
    endpoint: str = Field(..., pattern=r"^https://")
    method: str = Field(..., pattern=r"^(GET|POST|PUT|DELETE)$")
    authentication: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None
    response_schema: Optional[Dict[str, Any]] = None


class ToolUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    category: Optional[str] = None
    endpoint: Optional[str] = Field(None, pattern=r"^https://")
    method: Optional[str] = Field(None, pattern=r"^(GET|POST|PUT|DELETE)$")
    authentication: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None
    response_schema: Optional[Dict[str, Any]] = None


class ToolResponse(BaseModel):
    id: str
    client_id: str
    ultravox_tool_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    endpoint: str
    method: str
    authentication: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None
    response_schema: Optional[Dict[str, Any]] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

