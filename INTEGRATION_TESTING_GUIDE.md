# Backend-Frontend Integration Testing Guide

## Prerequisites

Before testing, ensure both services are running:

### 1. Start Backend
```bash
cd z-backend
# Activate virtual environment if using one
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Start backend server
uvicorn app.main:app --reload --port 8000
```

**Verify backend is running:**
- Open http://localhost:8000/docs (Swagger UI should load)
- Open http://localhost:8000/api/v1/auth/me (should return 401 - this is expected without auth)

### 2. Start Frontend
```bash
cd frontend
npm install  # if not already done
npm run dev
```

**Verify frontend is running:**
- Open http://localhost:3000 (should load the app)

### 3. Environment Configuration

**Backend** (`z-backend/.env`):
```bash
# Required
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
SUPABASE_SERVICE_KEY=your-service-key
JWT_AUDIENCE=your-jwt-audience
JWT_ISSUER=your-jwt-issuer
ULTRAVOX_API_KEY=your-ultravox-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET_UPLOADS=trudy-uploads

# CORS (important for frontend)
CORS_ORIGINS=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Testing Checklist

### ✅ Test 1: Authentication Flow

**Steps:**
1. Open http://localhost:3000
2. Navigate to login/signin page
3. Sign in with Google OAuth
4. Check browser console (F12) for errors

**What to verify:**
- [ ] User can successfully log in
- [ ] After login, redirected to dashboard
- [ ] No authentication errors in console
- [ ] Session is created (check Application > Cookies in DevTools)

**How to verify in code:**
```javascript
// Open browser console and check:
// 1. Check if API client has token
localStorage.getItem('next-auth.session-token') // Should exist

// 2. Check network tab
// Look for requests to /api/v1/auth/me
// Should return 200 with user data
```

---

### ✅ Test 2: API Client Configuration

**Steps:**
1. After logging in, open browser DevTools (F12)
2. Go to Network tab
3. Navigate to any page that makes API calls (e.g., Agents page)
4. Check the request headers

**What to verify:**
- [ ] `Authorization: Bearer <token>` header is present
- [ ] `x-client-id` header is present (if user is not agency_admin)
- [ ] `X-Request-Id` header is present
- [ ] `X-Idempotency-Key` header is present for POST/PATCH/PUT requests

**How to check:**
1. Open Network tab in DevTools
2. Click on any API request (e.g., `/api/v1/agents`)
3. Click on "Headers" tab
4. Scroll to "Request Headers"
5. Verify all required headers are present

**Expected Headers:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
x-client-id: 123e4567-e89b-12d3-a456-426614174000
X-Request-Id: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

---

### ✅ Test 3: Fetch Agents from API

**Steps:**
1. Log in to the application
2. Navigate to `/agents` page
3. Open browser DevTools > Network tab
4. Check if API call is made

**What to verify:**
- [ ] API call to `/api/v1/agents` is made
- [ ] Request returns 200 status
- [ ] Response has `{data: [...], meta: {...}}` format
- [ ] Agents are displayed on the page
- [ ] Loading state shows while fetching
- [ ] Empty state shows if no agents exist

**Expected API Call:**
```
GET http://localhost:8000/api/v1/agents
Headers:
  Authorization: Bearer <token>
  x-client-id: <client-id>
  X-Request-Id: <request-id>

Response (200 OK):
{
  "data": [
    {
      "id": "...",
      "name": "Agent Name",
      "client_id": "...",
      ...
    }
  ],
  "meta": {
    "request_id": "...",
    "ts": "2025-01-20T10:00:00Z"
  }
}
```

**How to test manually:**
```bash
# Get your auth token from browser (Application > Cookies > next-auth.session-token)
# Or from Network tab > Headers > Authorization

# Test with curl
curl -X GET "http://localhost:8000/api/v1/agents" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-client-id: YOUR_CLIENT_ID" \
  -H "X-Request-Id: test-request-123"
```

---

### ✅ Test 4: Create Agent

**Steps:**
1. Navigate to `/agents` page
2. Click "New agent" button
3. Fill in agent form
4. Submit the form
5. Check Network tab for API call

**What to verify:**
- [ ] POST request to `/api/v1/agents` is made
- [ ] Request includes `X-Idempotency-Key` header
- [ ] Request body matches backend schema
- [ ] Response returns created agent
- [ ] Agent appears in the list after creation
- [ ] No errors in console

**Expected API Call:**
```
POST http://localhost:8000/api/v1/agents
Headers:
  Authorization: Bearer <token>
  x-client-id: <client-id>
  X-Request-Id: <request-id>
  X-Idempotency-Key: <idempotency-key>
  Content-Type: application/json

Body:
{
  "name": "Test Agent",
  "description": "Test Description",
  "voice_id": "...",
  "system_prompt": "...",
  "model": "gpt-4",
  "tools": [],
  "knowledge_bases": []
}

Response (201 Created):
{
  "data": {
    "id": "...",
    "name": "Test Agent",
    ...
  },
  "meta": {...}
}
```

---

### ✅ Test 5: Update Agent

**Steps:**
1. Navigate to an existing agent
2. Make changes to agent details
3. Save changes
4. Check Network tab

**What to verify:**
- [ ] PATCH request to `/api/v1/agents/{id}` is made (NOT PUT)
- [ ] Request includes only changed fields
- [ ] Response returns updated agent
- [ ] UI updates with new data

**Expected API Call:**
```
PATCH http://localhost:8000/api/v1/agents/{id}
Headers:
  Authorization: Bearer <token>
  x-client-id: <client-id>
  X-Request-Id: <request-id>
  X-Idempotency-Key: <idempotency-key>
  Content-Type: application/json

Body:
{
  "name": "Updated Agent Name"
}
```

---

### ✅ Test 6: Error Handling

**Steps:**
1. Make an API call with invalid data
2. Or stop the backend server
3. Check how errors are handled

**What to verify:**
- [ ] Network errors are caught and displayed
- [ ] Backend error format `{error: {code, message, details}}` is handled
- [ ] User sees meaningful error messages
- [ ] No unhandled promise rejections in console

**Test scenarios:**
1. **Invalid data**: Try creating agent without required fields
2. **Network error**: Stop backend, try to fetch agents
3. **401 Unauthorized**: Use expired/invalid token
4. **403 Forbidden**: Try accessing resource without permissions

**Expected Error Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field: name",
    "details": {
      "field": "name"
    },
    "request_id": "...",
    "ts": "2025-01-20T10:00:00Z"
  }
}
```

---

### ✅ Test 7: React Query Cache

**Steps:**
1. Navigate to agents page (data loads)
2. Navigate away
3. Navigate back to agents page
4. Check Network tab

**What to verify:**
- [ ] Data is cached (no immediate API call on return)
- [ ] Background refetch happens after stale time
- [ ] Query keys include clientId: `['agents', clientId]`

**How to verify:**
1. Open React DevTools (if installed)
2. Go to React Query DevTools
3. Check query cache keys
4. Verify keys include clientId

---

### ✅ Test 8: Client ID Extraction

**Steps:**
1. Log in
2. Open browser console
3. Check if clientId is available

**What to verify:**
- [ ] clientId is extracted from session or `/auth/me` endpoint
- [ ] clientId is set on API client
- [ ] clientId is included in all API requests

**How to test:**
```javascript
// In browser console after login:
// Check if API client has clientId
// (This requires exposing a method or checking network requests)

// Check network request headers
// Look for x-client-id header in any API request
```

---

## Debugging Tools

### 1. Browser DevTools

**Network Tab:**
- Check all API requests
- Verify headers
- Check response format
- Monitor request/response timing

**Console Tab:**
- Check for JavaScript errors
- Check for API errors
- Log API client state

**Application Tab:**
- Check cookies (session tokens)
- Check localStorage
- Check session storage

### 2. Backend Logs

**Check backend console for:**
- Request logs
- Error logs
- Authentication logs
- Database query logs

**Example backend log:**
```
INFO:     127.0.0.1:52345 - "GET /api/v1/agents HTTP/1.1" 200 OK
INFO:     Request ID: 550e8400-e29b-41d4-a716-446655440000
INFO:     Client ID: 123e4567-e89b-12d3-a456-426614174000
```

### 3. Postman/Thunder Client

**Test API directly:**
1. Import Postman collection (if available)
2. Set up environment variables
3. Test endpoints independently
4. Compare with frontend behavior

### 4. React Query DevTools

**Install:**
```bash
npm install @tanstack/react-query-devtools
```

**Add to app:**
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// In your providers
<ReactQueryDevtools initialIsOpen={false} />
```

**Use to:**
- Inspect query cache
- Check query keys
- Monitor query states
- Manually invalidate queries

---

## Common Issues & Solutions

### Issue 1: CORS Error

**Symptom:**
```
Access to fetch at 'http://localhost:8000/api/v1/agents' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solution:**
1. Check backend CORS configuration
2. Ensure `CORS_ORIGINS=http://localhost:3000` in backend `.env`
3. Restart backend server

### Issue 2: 401 Unauthorized

**Symptom:**
```
GET /api/v1/agents 401 Unauthorized
```

**Solution:**
1. Check if user is logged in
2. Verify token is being sent in Authorization header
3. Check token is valid (not expired)
4. Verify JWT configuration matches between frontend and backend

### Issue 3: Missing x-client-id Header

**Symptom:**
```
400 Bad Request: Missing x-client-id header
```

**Solution:**
1. Check if `useAuthClient()` is being called
2. Verify clientId is being extracted from session
3. Check if `/auth/me` endpoint returns client_id
4. Verify `apiClient.setClientId()` is being called

### Issue 4: Data Not Loading

**Symptom:**
- Page loads but no data appears
- Loading spinner never stops

**Solution:**
1. Check Network tab for API calls
2. Verify API calls are being made
3. Check if queries are enabled (clientId available)
4. Check React Query DevTools for query state
5. Verify backend is returning data

### Issue 5: Double Data Wrapping

**Symptom:**
```
Error: Cannot read property 'data' of undefined
```

**Solution:**
1. Verify stores are using correct types
2. Check API client response format
3. Ensure stores use `Agent[]` not `{ data: Agent[] }`

---

## Quick Test Script

Create a test file to verify integration:

```typescript
// frontend/test-integration.ts
// Run this in browser console after login

async function testIntegration() {
  console.log('🧪 Testing Backend-Frontend Integration...\n')
  
  // Test 1: Check API client configuration
  console.log('1. Checking API client...')
  // (Would need to expose apiClient methods)
  
  // Test 2: Test API call
  console.log('2. Testing API call...')
  try {
    const response = await fetch('http://localhost:8000/api/v1/agents', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'x-client-id': localStorage.getItem('clientId') || '',
      }
    })
    const data = await response.json()
    console.log('✅ API call successful:', data)
  } catch (error) {
    console.error('❌ API call failed:', error)
  }
  
  // Test 3: Check headers
  console.log('3. Check Network tab for headers')
}

// Run: testIntegration()
```

---

## Success Criteria

Integration is successful when:

✅ **Authentication:**
- User can log in
- Token is stored and sent with requests
- Session persists across page refreshes

✅ **API Communication:**
- All API requests include required headers
- Responses are properly parsed
- Errors are handled gracefully

✅ **Data Flow:**
- Data loads from backend
- UI updates with real data
- Mutations (create/update/delete) work

✅ **Caching:**
- React Query caches data correctly
- Query keys include clientId
- Background refetch works

✅ **Error Handling:**
- Network errors are caught
- Backend errors are displayed
- User sees meaningful messages

---

## Next Steps After Testing

Once basic integration is verified:

1. **Test all CRUD operations** for each resource (agents, campaigns, voices, etc.)
2. **Test file uploads** (when implemented)
3. **Test realtime updates** (when implemented)
4. **Load testing** with multiple concurrent requests
5. **Error scenario testing** (network failures, invalid data, etc.)

---

## Need Help?

If tests fail:
1. Check browser console for errors
2. Check backend logs
3. Verify environment variables
4. Check network requests in DevTools
5. Compare with expected behavior in this guide

