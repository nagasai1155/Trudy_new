# Frontend-Backend Integration Summary

## ✅ Completed Integration Tasks

### 1. API Client Updates
- ✅ Updated API base URL to use `/api/v1` prefix (matches backend)
- ✅ Added `x-client-id` header support (required by backend for non-admin users)
- ✅ Implemented backend response format handling (`{data, meta}`)
- ✅ Implemented backend error format handling (`{error: {code, message, details}}`)
- ✅ Added automatic idempotency key generation for POST/PATCH/PUT requests
- ✅ Updated all HTTP methods to return `BackendResponse<T>` format

### 2. API Endpoints Alignment
- ✅ Updated all endpoints to match backend structure:
  - `/api/v1/auth/me` (was `/auth/me`)
  - `/api/v1/agents` (was `/agents`)
  - `/api/v1/campaigns` (was `/campaigns`)
  - `/api/v1/voices` (was `/voices`)
  - `/api/v1/kb` (was `/knowledge`)
  - `/api/v1/calls` (was `/calls`)
  - `/api/v1/tools` (was `/tools`)
- ✅ Added missing endpoints:
  - `/api/v1/voices/files/presign` (for voice sample uploads)
  - `/api/v1/kb/{id}/files/presign` (for knowledge base file uploads)
  - `/api/v1/kb/{id}/files/ingest` (for knowledge base ingestion)
  - `/api/v1/campaigns/{id}/contacts` (for adding contacts)
  - `/api/v1/campaigns/{id}/schedule` (for scheduling campaigns)

### 3. Type System Updates
- ✅ Updated `Agent` interface to match backend:
  - Changed `workspaceId` → `client_id`
  - Added `ultravox_agent_id`
  - Changed `prompt` → `system_prompt`
  - Changed `voice` → `voice_id` (string reference)
  - Changed `knowledgeBase` → `knowledge_bases` (array of IDs)
  - Updated status values: `'creating' | 'active' | 'inactive' | 'failed'`
  
- ✅ Updated `Voice` interface to match backend:
  - Added `client_id`
  - Added `ultravox_voice_id`
  - Changed `type` to `'custom' | 'reference'`
  - Added `training_info` object
  - Updated status: `'training' | 'active' | 'failed'`

- ✅ Updated `Campaign` interface to match backend:
  - Changed `workspaceId` → `client_id`
  - Changed `agentId` → `agent_id`
  - Added `schedule_type`: `'immediate' | 'scheduled'`
  - Added `scheduled_at`, `timezone`, `max_concurrent_calls`
  - Removed nested `contacts`, `schedule`, `settings` (handled separately)

- ✅ Updated `Call` interface to match backend:
  - Added `client_id`, `ultravox_call_id`
  - Changed field names to snake_case: `phone_number`, `duration_seconds`, `cost_usd`
  - Added `direction`: `'inbound' | 'outbound'`

- ✅ Updated `KnowledgeBase` interface to match backend:
  - Added `client_id`, `ultravox_corpus_id`
  - Changed status: `'creating' | 'ready' | 'processing' | 'failed'`
  - Added `document_counts` object

- ✅ Updated form types (`CreateAgentData`, `UpdateAgentData`, etc.) to match backend request schemas

### 4. React Hooks Updates
- ✅ Updated `useAgents` hook to use new response format
- ✅ Updated `useCampaigns` hook to use new response format
- ✅ Changed `PUT` to `PATCH` for update operations (matches backend)
- ✅ Removed unused `BackendResponse` imports

### 5. Documentation
- ✅ Created `API_KEYS_REQUIRED.md` with comprehensive list of:
  - Required API keys (Ultravox, Stripe, Telnyx)
  - Optional TTS provider keys (ElevenLabs, Google, AWS, Azure, OpenAI)
  - Environment variable setup instructions
  - Security best practices

## ⚠️ Still Required / Next Steps

### 1. Auth0 Integration (HIGH PRIORITY)
**Status**: Partially implemented - needs completion

**What's Done**:
- Created `frontend/src/lib/auth-client.ts` with `useAuthClient()` hook
- Added server-side `getServerAuthConfig()` function

**What's Needed**:
1. **Enable Auth0 in frontend**:
   - Uncomment Auth0 provider in `frontend/src/app/providers.tsx`
   - Update `frontend/src/middleware.ts` to use Auth0 middleware
   - Configure Auth0 environment variables in `.env.local`:
     ```bash
     AUTH0_SECRET=your-secret
     AUTH0_BASE_URL=http://localhost:3000
     AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
     AUTH0_CLIENT_ID=your-client-id
     AUTH0_CLIENT_SECRET=your-client-secret
     ```

2. **Get Access Token**:
   - The `useAuthClient()` hook needs to get the actual access token from Auth0
   - May need to use `getAccessToken()` from `@auth0/nextjs-auth0`
   - Token should be passed to `apiClient.setToken()`

3. **Extract Client ID**:
   - Client ID should come from Auth0 JWT claims or user metadata
   - Backend expects `client_id` in JWT claim: `client_id` or `https://trudy.ai/client_id`
   - Or from user metadata: `app_metadata.client_id` or `user_metadata.client_id`
   - Pass to `apiClient.setClientId()`

4. **Initialize in App Layout**:
   - Call `useAuthClient()` in your main layout or app component
   - This will automatically configure the API client with token and client_id

### 2. Backend Environment Variables
**Status**: Documentation created - needs configuration

**Required** (see `API_KEYS_REQUIRED.md`):
1. ✅ **Ultravox API Key** - CRITICAL, platform won't work without it
2. ✅ **Supabase** - Database connection
3. ✅ **Auth0** - JWT configuration
4. ✅ **AWS S3** - File uploads

**Recommended**:
5. ⚠️ **Stripe** - Payment processing
6. ⚠️ **Sentry** - Error monitoring

**Optional**:
7. ⚪ **Telnyx** - Additional telephony
8. ⚪ **TTS Providers** - ElevenLabs, Google, AWS, Azure, OpenAI (configured per-client)

### 3. Component Updates
**Status**: Types updated - components may need updates

Some components may still reference old field names. You may need to update:
- Agent forms/components using `workspaceId` → `client_id`
- Agent forms using `prompt` → `system_prompt`
- Campaign forms using old structure
- Voice components using old structure

### 4. Testing
**Status**: Not started

**Recommended Testing**:
1. Test API client with backend (ensure CORS is configured)
2. Test authentication flow
3. Test agent creation/update
4. Test campaign creation
5. Test voice cloning flow
6. Test knowledge base upload flow

## 🔧 Configuration Checklist

### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
AUTH0_SECRET=...
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
```

### Backend (`.env` in `z-backend/`)
```bash
# Core (Required)
SUPABASE_URL=...
SUPABASE_KEY=...
SUPABASE_SERVICE_KEY=...
JWT_AUDIENCE=...
JWT_ISSUER=...
ULTRAVOX_API_KEY=...  # CRITICAL
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_UPLOADS=trudy-uploads

# Optional
STRIPE_SECRET_KEY=...
TELNYX_API_KEY=...
SENTRY_DSN=...
```

## 📝 Notes

1. **Response Format**: Backend returns `{data: T, meta: {request_id, ts}}`. The API client now handles this automatically.

2. **Error Format**: Backend errors are `{error: {code, message, details, request_id, ts}}`. The API client extracts and throws meaningful errors.

3. **Idempotency**: All POST/PATCH/PUT requests automatically include `X-Idempotency-Key` header to prevent duplicate operations.

4. **Client ID Header**: The `x-client-id` header is automatically added when `apiClient.setClientId()` is called. This is required for non-admin users.

5. **CORS**: Ensure backend CORS is configured to allow requests from frontend origin (default: `http://localhost:3000`).

## 🚀 Quick Start

1. **Configure Backend**:
   ```bash
   cd z-backend
   cp .env.example .env  # or create .env
   # Add all required variables (see API_KEYS_REQUIRED.md)
   ```

2. **Configure Frontend**:
   ```bash
   cd frontend
   cp .env.example .env.local  # or create .env.local
   # Add Auth0 and API URL
   ```

3. **Start Backend**:
   ```bash
   cd z-backend
   uvicorn app.main:app --reload
   ```

4. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

5. **Complete Auth0 Setup**:
   - Enable Auth0 provider in `providers.tsx`
   - Update middleware
   - Test login flow
   - Verify API client gets token and client_id

## 🆘 Troubleshooting

### "Missing x-client-id header"
- Ensure `useAuthClient()` is called and extracts client_id from Auth0
- Check that `apiClient.setClientId()` is called with valid UUID

### "401 Unauthorized"
- Check Auth0 token is being set: `apiClient.setToken()`
- Verify token is valid and not expired
- Check backend JWT configuration matches Auth0

### "CORS error"
- Ensure backend CORS includes frontend origin
- Check `CORS_ORIGINS` in backend config

### "404 Not Found" on API calls
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is running on expected port
- Verify endpoint paths match backend routes

## 📚 Additional Resources

- Backend API Documentation: `http://localhost:8000/docs` (when backend is running)
- Integration Plan: `.integration`
- Backend Context: `backend-context`
- Frontend Context: `.frontend-context`
- API Keys Guide: `API_KEYS_REQUIRED.md`

