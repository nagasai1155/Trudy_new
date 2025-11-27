# Agents & Voices Flow Documentation

## Overview
This document explains the complete flow between Agents and Voices in the Trudy platform, including how they interact with Ultravox.

## Architecture

### Components
1. **Frontend (Next.js)**: React components, hooks, and API client
2. **Backend (FastAPI)**: API endpoints, database operations, Ultravox integration
3. **Ultravox**: External voice/agent service provider
4. **Database (Supabase)**: Stores voices, agents, and their relationships

---

## Voice Flow

### 1. Creating a Voice

**Frontend → Backend → Ultravox → Database**

```
User Action: Create Voice
    ↓
Frontend: POST /api/v1/voices
    ↓
Backend: 
  - Validates permissions (client_admin/agency_admin)
  - Checks credits (50 credits for native training)
  - Creates voice record in database (status: "training" or "active")
  - Generates presigned S3 URLs for audio samples (if native)
    ↓
Backend: POST /voices to Ultravox
  - Sends voice data + training samples (native) OR provider_voice_id (external)
    ↓
Ultravox: Creates voice, returns ultravox_voice_id
    ↓
Backend: 
  - Updates database with ultravox_voice_id
  - Debits 50 credits (if native)
  - Emits event: voice.training.started or voice.created
    ↓
Response: Voice object with status
```

**Voice Types:**
- **Native**: Custom voice cloned from audio samples (costs 50 credits, status: "training")
- **External**: Reference to provider voice (ElevenLabs, Google, etc.) (status: "active")

### 2. Listing Voices

**Frontend → Backend → Ultravox (sync) → Database**

```
Frontend: GET /api/v1/voices
    ↓
Backend:
  - Queries database for client's voices
  - For each voice with status="training" AND ultravox_voice_id:
    - Calls Ultravox: GET /voices/{ultravox_voice_id}
    - Updates status if changed (training → active/failed)
    - Updates progress if available
    - Saves to database
    ↓
Response: List of voices with updated status
```

**Real-time Updates:**
- Frontend polls every 3 seconds if any voice has status="training"
- Backend syncs status from Ultravox on each list request

### 3. Voice Status Lifecycle

```
created → training → active
              ↓
           failed
```

- **training**: Voice is being cloned/trained in Ultravox
- **active**: Voice is ready to use
- **failed**: Training failed (error in training_info)

---

## Agent Flow

### 1. Creating an Agent

**Frontend → Backend → Ultravox → Database**

```
User Action: Create Agent
    ↓
Frontend: 
  - Checks for active voices
  - Shows error if no active voice
  - Collects agent data (name, voice_id, system_prompt, etc.)
    ↓
Frontend: POST /api/v1/agents
    ↓
Backend:
  - Validates permissions
  - Validates voice exists AND status="active"
  - Validates voice has ultravox_voice_id
  - Validates knowledge bases (if provided)
  - Creates agent record in database (status: "creating")
    ↓
Backend: POST /agents to Ultravox
  - Sends agent data with:
    - voice: { provider, voice_id: ultravox_voice_id }
    - capabilities, settings, knowledge_base, tools
    ↓
Ultravox: Creates agent, returns ultravox_agent_id
    ↓
Backend:
  - Updates database with ultravox_agent_id
  - Updates status: "creating" → "active"
  - Emits event: agent.created
    ↓
Response: Agent object with status="active"
```

**Agent Requirements:**
- ✅ Must have an active voice (status="active")
- ✅ Voice must have ultravox_voice_id
- ✅ Knowledge bases (if provided) must be ready

### 2. Listing Agents

**Frontend → Backend → Database**

```
Frontend: GET /api/v1/agents
    ↓
Backend:
  - Queries database for client's agents
  - Returns list of agents
    ↓
Response: List of agents
```

**Real-time Updates:**
- Frontend polls every 3 seconds if any agent has status="creating"
- Backend doesn't sync from Ultravox (agents are created synchronously)

### 3. Agent Status Lifecycle

```
creating → active
    ↓
  failed
```

- **creating**: Agent is being created in Ultravox
- **active**: Agent is ready to use
- **failed**: Creation failed

---

## Key Relationships

### Voice → Agent
- **One Voice can have Many Agents**
- Agent requires voice to be "active"
- Agent stores `voice_id` (database ID) and uses `ultravox_voice_id` for Ultravox

### Database ↔ Ultravox
- **Database is source of truth** for client's voices/agents
- **Ultravox is source of truth** for training status and actual voice/agent resources
- Backend syncs status from Ultravox to database

---

## API Endpoints

### Voices
- `POST /api/v1/voices` - Create voice (native or external)
- `GET /api/v1/voices` - List voices (syncs training status from Ultravox)
- `GET /api/v1/voices/{id}` - Get single voice
- `DELETE /api/v1/voices/{id}` - Delete voice
- `POST /api/v1/voices/files/presign` - Get presigned URLs for uploads

### Agents
- `POST /api/v1/agents` - Create agent (requires active voice)
- `GET /api/v1/agents` - List agents
- `GET /api/v1/agents/{id}` - Get single agent
- `PATCH /api/v1/agents/{id}` - Update agent
- `DELETE /api/v1/agents/{id}` - Delete agent

---

## Common Issues & Solutions

### Issue 1: "No active voice found" when creating agent
**Cause**: No voices exist OR all voices are still training
**Solution**: 
- Create a voice first (native or external)
- Wait for training to complete if using native voice
- Use external voice (ElevenLabs reference) for immediate use

### Issue 2: Agent creation fails
**Possible Causes**:
- Voice not active (check voice status)
- Voice missing ultravox_voice_id (voice creation failed)
- Ultravox API error (check backend logs)
- Invalid agent data

**Solution**:
- Check voice status in database
- Verify Ultravox API key is configured
- Check backend logs for Ultravox errors

### Issue 3: Voices not updating from Ultravox
**Cause**: Backend not syncing status
**Solution**: 
- Backend now syncs status on list_voices request
- Frontend polls every 3 seconds for training voices
- Check Ultravox API connectivity

### Issue 4: Voice training stuck
**Cause**: Ultravox training failed or in progress
**Solution**:
- Check voice.training_info.error_message
- Check Ultravox dashboard
- Retry voice creation if failed

---

## Data Flow Diagram

```
┌─────────┐         ┌─────────┐         ┌──────────┐
│Frontend │────────▶│ Backend │────────▶│ Ultravox │
└─────────┘         └─────────┘         └──────────┘
     │                   │
     │                   ▼
     │              ┌─────────┐
     └─────────────▶│Database │
                    └─────────┘

1. User creates voice → Backend → Ultravox → Database
2. User lists voices → Backend → Database → (sync Ultravox) → Frontend
3. User creates agent → Backend → (validate voice) → Ultravox → Database
4. User lists agents → Backend → Database → Frontend
```

---

## Testing Checklist

- [ ] Create native voice (with audio samples)
- [ ] Create external voice (with provider_voice_id)
- [ ] List voices (verify Ultravox sync works)
- [ ] Create agent with active voice
- [ ] Verify agent creation fails with training voice
- [ ] Verify agent creation fails with no voice
- [ ] List agents
- [ ] Update agent
- [ ] Delete agent
- [ ] Delete voice (verify agents using it are handled)

---

## Environment Variables Required

**Backend:**
- `ULTRAVOX_API_KEY` - Ultravox API key
- `ULTRAVOX_BASE_URL` - Ultravox API base URL (default: https://api.ultravox.ai/v1)
- `SUPABASE_URL` - Supabase database URL
- `SUPABASE_KEY` - Supabase anon key
- `SUPABASE_SERVICE_KEY` - Supabase service key (for admin operations)
- `S3_BUCKET_UPLOADS` - S3 bucket for voice samples

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend API URL

