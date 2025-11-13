# 📬 Postman API Testing Guide - Trudy Backend

This guide will help you test all the Trudy Backend APIs with Postman, even if you're completely new to API testing!

---

## 🎯 Table of Contents
1. [Prerequisites & Setup](#prerequisites--setup)
2. [Getting Required Information](#getting-required-information)
3. [Setting Up Postman](#setting-up-postman)
4. [All API Endpoints Reference](#all-api-endpoints-reference)
5. [Step-by-Step Testing Guide](#step-by-step-testing-guide)
6. [Common Issues & Solutions](#common-issues--solutions)

---

## 📋 Prerequisites & Setup

### What You Need:
1. **Postman** - Download from [postman.com](https://www.postman.com/downloads/)
2. **Backend Running** - Your FastAPI backend should be running (usually at `http://localhost:8000`)
3. **Auth0 Account** - For JWT tokens
4. **Database Setup** - Supabase database with initial migration

### Required Values You'll Need:
- `BASE_URL` - Backend API URL (e.g., `http://localhost:8000`)
- `JWT_TOKEN` - Authentication token from Auth0
- `CLIENT_ID` - Your client/tenant ID (UUID format)
- `API_KEY` (optional) - For some external services

---

## 🔍 Getting Required Information

### 1. Get the BASE_URL
Your backend API base URL depends on where it's running:
- **Local Development**: `http://localhost:8000`
- **Production**: Your deployed URL (e.g., `https://api.trudy.ai`)

To verify it's running, open your browser and go to:
```
http://localhost:8000/health
```
You should see: `{"status": "healthy", "service": "trudy-api"}`

---

### 2. Get Your JWT_TOKEN (Authentication Token)

#### Option A: Using Auth0 Dashboard
1. Go to your Auth0 dashboard
2. Navigate to **Applications** → Your Application
3. Go to **Test** tab
4. Click "Get Token" or use the OAuth flow
5. Copy the JWT token (starts with `eyJ...`)

#### Option B: Using Frontend Login
1. Run your frontend application
2. Open Browser DevTools (F12)
3. Go to **Network** tab
4. Log in to your application
5. Look for API requests
6. Find the `Authorization` header
7. Copy the token after "Bearer " (e.g., `Bearer eyJ...` → copy `eyJ...`)

#### Option C: Using Auth0 Management API
```bash
# Get token via curl
curl --request POST \
  --url https://YOUR_DOMAIN.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{
    "client_id":"YOUR_CLIENT_ID",
    "client_secret":"YOUR_CLIENT_SECRET",
    "audience":"YOUR_API_AUDIENCE",
    "grant_type":"client_credentials"
  }'
```

**What a JWT Token looks like:**
```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ.eyJzdWIiOiJhdXRoMHw2MjNhYjY3ZjU4YTI5YTAwNjk1ZDYzZjEiLCJjbGllbnRfaWQiOiJhYmNkZWYxMjM0NTYiLCJyb2xlIjoiY2xpZW50X2FkbWluIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNjQ3ODk4NzYwLCJleHAiOjE2NDc5ODUxNjB9.signature...
```
*(This is just an example, yours will be much longer)*

---

### 3. Get Your CLIENT_ID

The `CLIENT_ID` is your tenant/organization ID in the system.

#### Where to find it:
1. **From Database**: Check your Supabase `clients` table
   ```sql
   SELECT id, name FROM clients;
   ```
   
2. **From JWT Token**: Decode your JWT token at [jwt.io](https://jwt.io)
   - Look for `client_id` in the payload
   
3. **From API**: Use the `/auth/me` endpoint (see below)

**CLIENT_ID Format**: UUID like `550e8400-e29b-41d4-a716-446655440000`

---

### 4. Understanding IDs in the System

All entities in Trudy use **UUIDs** (Universally Unique Identifiers):
- **Format**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Example**: `550e8400-e29b-41d4-a716-446655440000`

**Where you get IDs:**
- When you CREATE something (agent, campaign, voice), the response includes an `id`
- Copy this ID to use in UPDATE, GET, or DELETE operations
- Store commonly used IDs in Postman environment variables

---

## 🛠️ Setting Up Postman

### Step 1: Create a New Collection
1. Open Postman
2. Click **New** → **Collection**
3. Name it "Trudy API Tests"
4. Click **Create**

### Step 2: Set Up Environment Variables
1. Click the **Environments** tab (left sidebar)
2. Click **+** to create new environment
3. Name it "Trudy Local" or "Trudy Dev"
4. Add these variables:

| Variable Name | Initial Value | Current Value | Description |
|--------------|---------------|---------------|-------------|
| `base_url` | `http://localhost:8000` | `http://localhost:8000` | API base URL |
| `jwt_token` | `your_token_here` | `your_token_here` | JWT from Auth0 |
| `client_id` | `your_client_id` | `your_client_id` | Your tenant ID |
| `agent_id` | (empty) | (empty) | Will be filled after creating agent |
| `campaign_id` | (empty) | (empty) | Will be filled after creating campaign |
| `voice_id` | (empty) | (empty) | Will be filled after creating voice |
| `call_id` | (empty) | (empty) | Will be filled after making a call |

5. Click **Save**
6. Select this environment (dropdown in top-right)

---

## 📚 All API Endpoints Reference

### Base URL: `{{base_url}}/api/v1`

---

### 🔐 1. AUTHENTICATION & USER MANAGEMENT

#### 1.1 Get Current User Info
- **Endpoint**: `GET /api/v1/auth/me`
- **Purpose**: Get your user details and verify authentication
- **Authentication**: Required
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  x-client-id: {{client_id}}
  Content-Type: application/json
  ```
- **Request Body**: None
- **Response Example**:
  ```json
  {
    "data": {
      "id": "user-uuid",
      "auth0_sub": "auth0|123456",
      "email": "user@example.com",
      "role": "client_admin",
      "client_id": "client-uuid"
    },
    "meta": {
      "request_id": "req_123",
      "ts": "2025-11-12T10:00:00Z"
    }
  }
  ```

#### 1.2 List Clients
- **Endpoint**: `GET /api/v1/auth/clients`
- **Purpose**: Get list of clients (for agency admins)
- **Authentication**: Required
- **Headers**: Same as above
- **Request Body**: None

#### 1.3 Create API Key
- **Endpoint**: `POST /api/v1/auth/api-keys`
- **Purpose**: Create encrypted API keys for external services
- **Authentication**: Required (admin only)
- **Request Body**:
  ```json
  {
    "name": "Ultravox API Key",
    "service": "ultravox",
    "key": "your-api-key-value"
  }
  ```

---

### 🎤 2. VOICES

#### 2.1 Get Presigned URLs for Voice Samples
- **Endpoint**: `POST /api/v1/voices/files/presign`
- **Purpose**: Get S3 upload URLs for voice training samples
- **Authentication**: Required (admin only)
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  x-client-id: {{client_id}}
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "files": [
      {
        "filename": "sample1.wav",
        "content_type": "audio/wav"
      },
      {
        "filename": "sample2.wav",
        "content_type": "audio/wav"
      }
    ]
  }
  ```
- **Response**: Presigned URLs for uploading

#### 2.2 Create Voice
- **Endpoint**: `POST /api/v1/voices`
- **Purpose**: Create a custom voice (clone) or reference an external voice
- **Authentication**: Required (admin only)
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  x-client-id: {{client_id}}
  Content-Type: application/json
  X-Idempotency-Key: {{$guid}}  (Optional)
  ```
- **Request Body (Native Clone)**:
  ```json
  {
    "name": "John's Voice",
    "strategy": "native",
    "source": {
      "samples": [
        {
          "s3_key": "uploads/client_xxx/voices/xxx/sample_0.wav",
          "text": "Hello, this is a sample recording",
          "duration_seconds": 5.2
        }
      ]
    },
    "provider_overrides": {
      "provider": "elevenlabs"
    }
  }
  ```
- **Request Body (External Reference)**:
  ```json
  {
    "name": "Pre-built Voice",
    "strategy": "reference",
    "source": {
      "provider_voice_id": "elevenlabs-voice-id-123"
    }
  }
  ```

#### 2.3 List Voices
- **Endpoint**: `GET /api/v1/voices`
- **Purpose**: Get all voices for your client
- **Authentication**: Required
- **Request Body**: None

#### 2.4 Get Single Voice
- **Endpoint**: `GET /api/v1/voices/{voice_id}`
- **Purpose**: Get details of a specific voice
- **Authentication**: Required
- **URL Parameters**: 
  - `voice_id` - UUID of the voice
- **Example**: `GET /api/v1/voices/550e8400-e29b-41d4-a716-446655440000`

---

### 🤖 3. AGENTS

#### 3.1 Create Agent
- **Endpoint**: `POST /api/v1/agents`
- **Purpose**: Create an AI agent with voice, prompt, and tools
- **Authentication**: Required (admin only)
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  x-client-id: {{client_id}}
  Content-Type: application/json
  X-Idempotency-Key: {{$guid}}  (Optional)
  ```
- **Request Body**:
  ```json
  {
    "name": "Sales Agent",
    "description": "AI agent for sales calls",
    "voice_id": "voice-uuid-here",
    "system_prompt": "You are a professional sales representative. Be friendly and helpful.",
    "model": "gpt-4",
    "tools": [
      {
        "type": "function",
        "name": "schedule_meeting",
        "description": "Schedule a meeting",
        "parameters": {
          "type": "object",
          "properties": {
            "date": {"type": "string"},
            "time": {"type": "string"}
          }
        }
      }
    ],
    "knowledge_bases": []
  }
  ```
- **Save Response**: Copy the `id` from response to `{{agent_id}}` variable!

#### 3.2 Update Agent
- **Endpoint**: `PATCH /api/v1/agents/{agent_id}`
- **Purpose**: Update agent configuration
- **Authentication**: Required (admin only)
- **Request Body** (only include fields to update):
  ```json
  {
    "name": "Updated Sales Agent",
    "system_prompt": "New prompt here"
  }
  ```

#### 3.3 List Agents
- **Endpoint**: `GET /api/v1/agents`
- **Purpose**: Get all agents
- **Authentication**: Required

#### 3.4 Get Single Agent
- **Endpoint**: `GET /api/v1/agents/{agent_id}`
- **Purpose**: Get specific agent details
- **Authentication**: Required
- **Example**: `GET /api/v1/agents/{{agent_id}}`

---

### 📞 4. CALLS

#### 4.1 Create Call
- **Endpoint**: `POST /api/v1/calls`
- **Purpose**: Initiate an outbound call
- **Authentication**: Required
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  x-client-id: {{client_id}}
  Content-Type: application/json
  X-Idempotency-Key: {{$guid}}
  ```
- **Request Body**:
  ```json
  {
    "agent_id": "agent-uuid",
    "phone_number": "+14155551234",
    "context": {
      "customer_name": "John Doe",
      "account_id": "ACC123"
    }
  }
  ```

#### 4.2 Get Call Details
- **Endpoint**: `GET /api/v1/calls/{call_id}`
- **Purpose**: Get call status and details
- **Authentication**: Required

#### 4.3 Get Call Transcript
- **Endpoint**: `GET /api/v1/calls/{call_id}/transcript`
- **Purpose**: Get conversation transcript
- **Authentication**: Required

#### 4.4 Get Call Recording URL
- **Endpoint**: `GET /api/v1/calls/{call_id}/recording`
- **Purpose**: Get presigned URL to download call recording
- **Authentication**: Required

---

### 📢 5. CAMPAIGNS

#### 5.1 Create Campaign
- **Endpoint**: `POST /api/v1/campaigns`
- **Purpose**: Create a calling campaign
- **Authentication**: Required (admin only)
- **Headers**:
  ```
  Authorization: Bearer {{jwt_token}}
  x-client-id: {{client_id}}
  Content-Type: application/json
  X-Idempotency-Key: {{$guid}}
  ```
- **Request Body**:
  ```json
  {
    "name": "Q4 Sales Campaign",
    "agent_id": "agent-uuid",
    "schedule_type": "immediate",
    "scheduled_at": null,
    "timezone": "America/New_York",
    "max_concurrent_calls": 5
  }
  ```
- **Schedule Types**: `"immediate"`, `"scheduled"`, `"recurring"`
- **Save Response**: Copy `id` to `{{campaign_id}}`!

#### 5.2 Get Presigned URL for Contacts CSV
- **Endpoint**: `POST /api/v1/campaigns/{campaign_id}/contacts/presign`
- **Purpose**: Get S3 upload URL for contacts CSV
- **Authentication**: Required (admin only)
- **Request Body**: None
- **Response**: Returns upload URL and instructions

#### 5.3 Upload Campaign Contacts
- **Endpoint**: `POST /api/v1/campaigns/{campaign_id}/contacts`
- **Purpose**: Add contacts to campaign
- **Authentication**: Required (admin only)
- **Request Body (Option A - Direct Array)**:
  ```json
  {
    "contacts": [
      {
        "phone_number": "+14155551234",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "custom_fields": {
          "company": "Acme Inc",
          "account_id": "ACC123"
        }
      },
      {
        "phone_number": "+14155555678",
        "first_name": "Jane",
        "last_name": "Smith"
      }
    ]
  }
  ```
- **Request Body (Option B - CSV from S3)**:
  ```json
  {
    "s3_key": "uploads/client_xxx/campaigns/yyy/contacts.csv"
  }
  ```

#### 5.4 Schedule Campaign
- **Endpoint**: `POST /api/v1/campaigns/{campaign_id}/schedule`
- **Purpose**: Start the campaign (make calls)
- **Authentication**: Required (admin only)
- **Request Body**: None
- **Note**: Campaign must be in "draft" status with contacts added

#### 5.5 List Campaigns
- **Endpoint**: `GET /api/v1/campaigns`
- **Purpose**: Get all campaigns
- **Authentication**: Required
- **Query Parameters** (optional):
  - `agent_id` - Filter by agent
  - `status` - Filter by status (draft, scheduled, running, completed, etc.)
  - `limit` - Results per page (default: 50)
  - `offset` - Pagination offset (default: 0)
- **Example**: `GET /api/v1/campaigns?status=running&limit=10`

#### 5.6 Get Campaign
- **Endpoint**: `GET /api/v1/campaigns/{campaign_id}`
- **Purpose**: Get campaign details and stats
- **Authentication**: Required

#### 5.7 Update Campaign
- **Endpoint**: `PATCH /api/v1/campaigns/{campaign_id}`
- **Purpose**: Update campaign (only in draft status)
- **Authentication**: Required (admin only)
- **Request Body**:
  ```json
  {
    "name": "Updated Campaign Name",
    "max_concurrent_calls": 10
  }
  ```

#### 5.8 Delete Campaign
- **Endpoint**: `DELETE /api/v1/campaigns/{campaign_id}`
- **Purpose**: Delete campaign (only draft or failed)
- **Authentication**: Required (admin only)

---

### 📚 6. KNOWLEDGE BASES

#### 6.1 Create Knowledge Base
- **Endpoint**: `POST /api/v1/kb`
- **Purpose**: Create a knowledge base for agent context
- **Authentication**: Required (admin only)
- **Request Body**:
  ```json
  {
    "name": "Product Documentation",
    "description": "All product docs and FAQs"
  }
  ```

#### 6.2 Get Presigned URLs for KB Files
- **Endpoint**: `POST /api/v1/kb/{kb_id}/files/presign`
- **Purpose**: Get upload URLs for documents
- **Authentication**: Required (admin only)
- **Request Body**:
  ```json
  {
    "files": [
      {
        "filename": "product-guide.pdf",
        "content_type": "application/pdf"
      }
    ]
  }
  ```

#### 6.3 Ingest Files into Knowledge Base
- **Endpoint**: `POST /api/v1/kb/{kb_id}/files/ingest`
- **Purpose**: Process uploaded files
- **Authentication**: Required (admin only)
- **Request Body**:
  ```json
  {
    "files": [
      {
        "s3_key": "uploads/client_xxx/kb/yyy/product-guide.pdf",
        "filename": "product-guide.pdf"
      }
    ]
  }
  ```

#### 6.4 Get Knowledge Base
- **Endpoint**: `GET /api/v1/kb/{kb_id}`
- **Purpose**: Get KB details and status
- **Authentication**: Required

---

### 🔧 7. TOOLS

#### 7.1 Create Tool
- **Endpoint**: `POST /api/v1/tools`
- **Purpose**: Create custom tools for agents
- **Authentication**: Required (admin only)
- **Request Body**:
  ```json
  {
    "name": "Get Weather",
    "type": "api",
    "description": "Get current weather for a location",
    "config": {
      "endpoint": "https://api.weather.com/v1/current",
      "method": "GET",
      "headers": {
        "Authorization": "Bearer token"
      }
    }
  }
  ```

#### 7.2 List Tools
- **Endpoint**: `GET /api/v1/tools`
- **Purpose**: Get all tools
- **Authentication**: Required

---

### 🔗 8. WEBHOOKS

#### 8.1 Ultravox Webhook (Ingress)
- **Endpoint**: `POST /api/v1/webhooks/ultravox`
- **Purpose**: Receive webhooks from Ultravox
- **Authentication**: Webhook signature verification
- **Note**: This is called BY Ultravox, not by you

#### 8.2 Stripe Webhook (Ingress)
- **Endpoint**: `POST /api/v1/webhooks/stripe`
- **Purpose**: Receive webhooks from Stripe
- **Authentication**: Webhook signature verification

#### 8.3 Create Webhook Endpoint (Egress)
- **Endpoint**: `POST /api/v1/webhooks`
- **Purpose**: Register your webhook to receive events
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "url": "https://your-server.com/webhooks/trudy",
    "events": ["call.completed", "campaign.completed"],
    "description": "Production webhook"
  }
  ```

#### 8.4 List Webhook Endpoints
- **Endpoint**: `GET /api/v1/webhooks`
- **Purpose**: Get your registered webhooks
- **Authentication**: Required

#### 8.5 Delete Webhook
- **Endpoint**: `DELETE /api/v1/webhooks/{webhook_id}`
- **Purpose**: Remove webhook endpoint
- **Authentication**: Required

---

### 🏥 9. HEALTH CHECK

#### 9.1 Health Check
- **Endpoint**: `GET /health`
- **Purpose**: Check if API is running
- **Authentication**: None
- **Response**:
  ```json
  {
    "status": "healthy",
    "service": "trudy-api"
  }
  ```

---

## 🚀 Step-by-Step Testing Guide

### 🎬 Complete Testing Flow

Follow these steps in order to test the full system:

---

### **STEP 1: Verify Backend is Running**

**Request:**
```
GET {{base_url}}/health
```
**Headers:** None
**Expected Response:**
```json
{
  "status": "healthy",
  "service": "trudy-api"
}
```
✅ If you see this, backend is running!

---

### **STEP 2: Get Your User Info**

**Request:**
```
GET {{base_url}}/api/v1/auth/me
```
**Headers:**
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
```
**Expected Response:**
```json
{
  "data": {
    "id": "user-uuid",
    "email": "you@example.com",
    "role": "client_admin",
    "client_id": "client-uuid"
  },
  "meta": {...}
}
```

**Action:**
- ✅ Verify your `client_id` matches
- ✅ Save the `client_id` if you didn't have it

---

### **STEP 3: Create a Voice**

First, we need a voice for our agent.

**Request:**
```
POST {{base_url}}/api/v1/voices
```
**Headers:**
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Test Voice",
  "strategy": "reference",
  "source": {
    "provider_voice_id": "elevenlabs-default-voice"
  }
}
```

**Action:**
- ✅ Copy the `id` from response
- ✅ Save it as `{{voice_id}}` in Postman environment
- ✅ Note: Status should be "active" for reference voices

---

### **STEP 4: Create an Agent**

**Request:**
```
POST {{base_url}}/api/v1/agents
```
**Headers:**
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
X-Idempotency-Key: {{$guid}}
```
**Body:**
```json
{
  "name": "Test Sales Agent",
  "description": "Agent for testing",
  "voice_id": "{{voice_id}}",
  "system_prompt": "You are a friendly sales assistant. Be helpful and professional.",
  "model": "gpt-4",
  "tools": [],
  "knowledge_bases": []
}
```

**Action:**
- ✅ Copy the `id` from response
- ✅ Save it as `{{agent_id}}`
- ✅ Verify status is "active"

---

### **STEP 5: List Agents**

**Request:**
```
GET {{base_url}}/api/v1/agents
```
**Headers:**
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
```

**Action:**
- ✅ You should see your agent in the list

---

### **STEP 6: Get Specific Agent**

**Request:**
```
GET {{base_url}}/api/v1/agents/{{agent_id}}
```
**Headers:**
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
```

**Action:**
- ✅ Verify all agent details are correct

---

### **STEP 7: Create a Campaign**

**Request:**
```
POST {{base_url}}/api/v1/campaigns
```
**Headers:**
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
X-Idempotency-Key: {{$guid}}
```
**Body:**
```json
{
  "name": "Test Campaign",
  "agent_id": "{{agent_id}}",
  "schedule_type": "immediate",
  "scheduled_at": null,
  "timezone": "America/New_York",
  "max_concurrent_calls": 5
}
```

**Action:**
- ✅ Copy the `id` from response
- ✅ Save it as `{{campaign_id}}`
- ✅ Status should be "draft"

---

### **STEP 8: Add Contacts to Campaign**

**Request:**
```
POST {{base_url}}/api/v1/campaigns/{{campaign_id}}/contacts
```
**Headers:**
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
```
**Body:**
```json
{
  "contacts": [
    {
      "phone_number": "+14155551234",
      "first_name": "Test",
      "last_name": "User",
      "email": "test@example.com"
    }
  ]
}
```

**Action:**
- ✅ Verify `contacts_added: 1`
- ✅ Check campaign stats show pending contacts

---

### **STEP 9: Schedule Campaign**

**⚠️ WARNING**: This will actually make real calls!

**Request:**
```
POST {{base_url}}/api/v1/campaigns/{{campaign_id}}/schedule
```
**Headers:**
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
```
**Body:** None

**Action:**
- ✅ Campaign status changes to "scheduled"
- ✅ Calls will start being made

---

### **STEP 10: Check Campaign Status**

**Request:**
```
GET {{base_url}}/api/v1/campaigns/{{campaign_id}}
```
**Headers:**
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
```

**Action:**
- ✅ Check stats: pending, calling, completed, failed
- ✅ Monitor progress

---

### **STEP 11: Make a Single Call (Alternative)**

If you want to test a single call instead of a campaign:

**Request:**
```
POST {{base_url}}/api/v1/calls
```
**Headers:**
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
X-Idempotency-Key: {{$guid}}
```
**Body:**
```json
{
  "agent_id": "{{agent_id}}",
  "phone_number": "+14155551234",
  "context": {
    "customer_name": "John Doe"
  }
}
```

**Action:**
- ✅ Save `id` as `{{call_id}}`

---

### **STEP 12: Get Call Details**

**Request:**
```
GET {{base_url}}/api/v1/calls/{{call_id}}
```
**Headers:**
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
```

**Action:**
- ✅ Check call status
- ✅ View duration, outcome, etc.

---

### **STEP 13: Get Call Transcript**

**Request:**
```
GET {{base_url}}/api/v1/calls/{{call_id}}/transcript
```
**Headers:**
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
```

**Action:**
- ✅ Read conversation transcript

---

### **STEP 14: Get Call Recording**

**Request:**
```
GET {{base_url}}/api/v1/calls/{{call_id}}/recording
```
**Headers:**
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
```

**Response:**
```json
{
  "data": {
    "recording_url": "https://s3.amazonaws.com/...",
    "expires_at": "2025-11-12T23:59:59Z"
  }
}
```

**Action:**
- ✅ Copy URL and open in browser to download

---

## 🔍 Testing Tips

### Using Postman Variables

In any field, you can use variables like this:
```
{{variable_name}}
```

**Auto-generated variables:**
- `{{$guid}}` - Auto-generates a UUID
- `{{$timestamp}}` - Current Unix timestamp
- `{{$randomInt}}` - Random integer

### Saving Response Data

To automatically save IDs from responses:

1. Go to the **Tests** tab in your request
2. Add this script:

```javascript
// Save agent_id from response
if (pm.response.json().data && pm.response.json().data.id) {
    pm.environment.set("agent_id", pm.response.json().data.id);
    console.log("Saved agent_id: " + pm.response.json().data.id);
}
```

### Creating Request Collections

Organize your requests:
```
Trudy API Tests/
├── 1. Authentication/
│   └── Get Current User
├── 2. Voices/
│   ├── Create Voice
│   ├── List Voices
│   └── Get Voice
├── 3. Agents/
│   ├── Create Agent
│   ├── List Agents
│   ├── Get Agent
│   └── Update Agent
└── 4. Campaigns/
    ├── Create Campaign
    ├── Add Contacts
    └── Schedule Campaign
```

---

## ❌ Common Issues & Solutions

### Issue 1: 401 Unauthorized
**Error:**
```json
{
  "error": {
    "code": "unauthorized",
    "message": "Invalid or expired token"
  }
}
```

**Solutions:**
✅ Check your JWT token is correct and not expired
✅ Verify Authorization header: `Bearer {{jwt_token}}`
✅ Get a fresh token from Auth0

---

### Issue 2: Missing x-client-id Header
**Error:**
```json
{
  "error": {
    "code": "unauthorized",
    "message": "Missing x-client-id header"
  }
}
```

**Solution:**
✅ Add header: `x-client-id: {{client_id}}`

---

### Issue 3: 403 Forbidden
**Error:**
```json
{
  "error": {
    "code": "forbidden",
    "message": "Insufficient permissions"
  }
}
```

**Solutions:**
✅ Check your user role (must be `client_admin` or `agency_admin` for certain operations)
✅ Verify you're accessing resources in your own client

---

### Issue 4: 404 Not Found
**Error:**
```json
{
  "error": {
    "code": "not_found",
    "message": "agent not found"
  }
}
```

**Solutions:**
✅ Verify the ID exists (check your environment variables)
✅ Make sure you created the resource first
✅ Check you're using the correct client_id

---

### Issue 5: 422 Validation Error
**Error:**
```json
{
  "error": {
    "code": "validation_error",
    "message": "Voice must be active",
    "details": {"voice_id": "xxx", "voice_status": "training"}
  }
}
```

**Solutions:**
✅ Read the error message carefully
✅ Check required fields are present
✅ Verify relationships (e.g., voice is active, agent exists)

---

### Issue 6: Connection Refused
**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```

**Solutions:**
✅ Start your backend server:
```bash
cd z-backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

---

### Issue 7: CORS Error (in Browser)
**Error:**
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solution:**
✅ This shouldn't happen in Postman
✅ If testing in browser, backend CORS is already configured for localhost:3000

---

## 📝 Quick Reference Card

### Essential Headers for ALL Authenticated Requests:
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
```

### Optional Headers:
```
X-Idempotency-Key: {{$guid}}  (for POST/PATCH to prevent duplicates)
```

### Common HTTP Methods:
- `GET` - Retrieve data (no body)
- `POST` - Create new resource (requires body)
- `PATCH` - Update existing resource (partial update)
- `DELETE` - Remove resource (no body)

### Response Structure:
```json
{
  "data": { /* your data */ },
  "meta": {
    "request_id": "req_xxx",
    "ts": "2025-11-12T10:00:00Z"
  }
}
```

### Status Codes:
- `200` - Success (GET, PATCH, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (bad/missing token)
- `403` - Forbidden (no permission)
- `404` - Not Found (resource doesn't exist)
- `422` - Validation Error
- `500` - Server Error

---

## 🎓 Learning Path for Beginners

### Day 1: Setup & Authentication
1. ✅ Install Postman
2. ✅ Set up environment variables
3. ✅ Test health check
4. ✅ Get your user info

### Day 2: Basic CRUD Operations
1. ✅ Create a voice
2. ✅ List voices
3. ✅ Create an agent
4. ✅ Update an agent

### Day 3: Campaigns
1. ✅ Create a campaign
2. ✅ Add contacts
3. ✅ List campaigns

### Day 4: Calls & Advanced
1. ✅ Make a test call
2. ✅ Get call details
3. ✅ Download transcript
4. ✅ Schedule a campaign

---

## 🆘 Getting Help

If you're stuck:

1. **Check Error Messages** - They usually tell you what's wrong
2. **Verify Variables** - Make sure `{{agent_id}}` etc. are set
3. **Check Backend Logs** - Look at your terminal running the backend
4. **API Documentation** - Visit `http://localhost:8000/docs` for interactive docs
5. **Database** - Check Supabase dashboard to verify data

---

## 🎉 You're Ready!

You now have everything you need to test the Trudy Backend APIs!

**Next Steps:**
1. Start with the health check
2. Authenticate and get your user info
3. Follow the step-by-step testing guide
4. Build your own flows
5. Experiment!

**Remember:** 
- Save IDs from responses to use in subsequent requests
- Use environment variables for reusable values
- Read error messages carefully
- Test in a safe environment first

Happy Testing! 🚀

