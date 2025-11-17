# 🔐 Role-Based Testing Guide - Trudy Backend

This guide provides step-by-step instructions for testing the Trudy Backend API with all 3 user roles: `agency_admin`, `client_admin`, and `client_user`.

---

## 📋 Table of Contents

1. [Understanding the Roles](#understanding-the-roles)
2. [Prerequisites](#prerequisites)
3. [Setting Up Roles in Auth0](#setting-up-roles-in-auth0)
4. [Setting Up Roles in Database](#setting-up-roles-in-database)
5. [Getting JWT Tokens for Each Role](#getting-jwt-tokens-for-each-role)
6. [Testing Scenarios](#testing-scenarios)
7. [Complete Test Checklist](#complete-test-checklist)
8. [Troubleshooting](#troubleshooting)

---

## 🎭 Understanding the Roles

| Role | Access Level | `x-client-id` Required | Can Create Resources | Can Access Admin Endpoints |
|------|-------------|------------------------|---------------------|---------------------------|
| **`agency_admin`** | All clients | ❌ No | ✅ Yes (all clients) | ✅ Yes |
| **`client_admin`** | Own client only | ✅ Yes | ✅ Yes (own client) | ❌ No |
| **`client_user`** | Own client only | ✅ Yes | ❌ No | ❌ No |

---

## 📦 Prerequisites

1. ✅ Backend running at `http://localhost:8000`
2. ✅ Auth0 account configured
3. ✅ Database (Supabase) with migrations applied
4. ✅ Postman installed (or curl/HTTP client)
5. ✅ At least 2 clients created in the database

---

## 🔧 Setting Up Roles in Auth0

### Step 1: Create Auth0 Actions/Rules to Add Role to JWT

You need to configure Auth0 to include the `role` claim in JWT tokens. There are two methods:

#### Method A: Using Auth0 Actions (Recommended)

**⚠️ Important:** This action works for **ALL roles** (agency_admin, client_admin, client_user). It dynamically reads the role from each user's metadata and adds it to the JWT token. You only need to create this action **once**, then set the role in each user's metadata individually.

1. Go to **Auth0 Dashboard** → **Actions** → **Triggers**
2. Click on **Login** trigger
3. Click **+ Add Action** button (top right)
4. Click **Build Custom** to create a new action
5. Give it a name like "Add Role to Token"
6. Paste this code:

```javascript
/**
* Handler that will be called during the execution of a PostLogin flow.
* 
* This action works for ALL roles: agency_admin, client_admin, and client_user.
* It reads the role from the user's metadata and adds it to the JWT token.
* 
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://trudy.ai/';
  
  // Get role from app_metadata or user_metadata
  // This can be: "agency_admin", "client_admin", or "client_user"
  // You set this individually for each user (see Step 2 below)
  const role = event.user.app_metadata?.role || 
               event.user.user_metadata?.role || 
               'client_user'; // Default role if not set
  
  // Get client_id from app_metadata or user_metadata
  // This should be the UUID of the tenant/client (e.g., "550e8400-e29b-41d4-a716-446655440001")
  const clientId = event.user.app_metadata?.client_id || 
                   event.user.user_metadata?.client_id;
  
  // Add role to ID token (used for frontend)
  if (api.idToken) {
    api.idToken.setCustomClaim(`${namespace}role`, role);
    api.idToken.setCustomClaim(`${namespace}client_id`, clientId);
  }
  
  // Add role to access token (used for API authentication)
  if (api.accessToken) {
    api.accessToken.setCustomClaim(`${namespace}role`, role);
    api.accessToken.setCustomClaim(`${namespace}client_id`, clientId);
  }
};
```

**How it works:**
- This **single action** handles all three roles
- It reads the `role` from each user's metadata (`app_metadata` or `user_metadata`)
- If no role is set, it defaults to `'client_user'`
- The role can be: `"agency_admin"`, `"client_admin"`, or `"client_user"`
- You'll set the role individually for each user in Step 2 below

7. Click **Deploy** button to save and deploy the action
8. Go back to **Actions** → **Triggers** → **Login**
9. You should now see your custom action in the flow. Drag it into the flow if needed (should appear automatically)
10. Click **Apply** to save the trigger configuration

#### Method B: Using Auth0 Rules (Legacy)

1. Go to **Auth0 Dashboard** → **Rules**
2. Click **Create Rule**
3. Select **Empty Rule**
4. Add this code:

```javascript
function (user, context, callback) {
  const namespace = 'https://trudy.ai/';
  
  // Get role from app_metadata or user_metadata
  const role = user.app_metadata?.role || 
               user.user_metadata?.role || 
               'client_user';
  
  // Get client_id from app_metadata or user_metadata
  const clientId = user.app_metadata?.client_id || 
                   user.user_metadata?.client_id;
  
  context.idToken[`${namespace}role`] = role;
  context.idToken[`${namespace}client_id`] = clientId;
  context.accessToken[`${namespace}role`] = role;
  context.accessToken[`${namespace}client_id`] = clientId;
  
  callback(null, user, context);
}
```

5. Save the rule

### Step 2: Set User Metadata in Auth0

For each user, you need to set their role and client_id:

#### Option A: Via Auth0 Dashboard

1. Go to **Users** → Select a user
2. Scroll to **Metadata** section
3. Click **Edit** on `app_metadata` or `user_metadata`
4. Add JSON:

```json
{
  "role": "client_admin",
  "client_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Option B: Via Auth0 Management API

```bash
curl --request PATCH \
  --url 'https://YOUR_DOMAIN.auth0.com/api/v2/users/auth0|USER_ID' \
  --header 'authorization: Bearer YOUR_MANAGEMENT_API_TOKEN' \
  --header 'content-type: application/json' \
  --data '{
    "app_metadata": {
      "role": "client_admin",
      "client_id": "550e8400-e29b-41d4-a716-446655440000"
    }
  }'
```

---

## 💾 Setting Up Roles in Database

### Step 1: Create Test Clients

First, create at least 2 clients in your database:

```sql
-- Client 1 (for testing)
INSERT INTO clients (id, name, email, subscription_status, credits_balance)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Test Client A',
  'clienta@test.com',
  'active',
  1000
);

-- Client 2 (for testing)
INSERT INTO clients (id, name, email, subscription_status, credits_balance)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'Test Client B',
  'clientb@test.com',
  'active',
  1000
);
```

### Step 2: Create Users in Database

Link Auth0 users to your database:

```sql
-- Agency Admin User
INSERT INTO users (auth0_sub, client_id, email, role)
VALUES (
  'auth0|AGENCY_ADMIN_AUTH0_SUB',
  '550e8400-e29b-41d4-a716-446655440001', -- Can be any client_id, agency_admin sees all
  'agency.admin@test.com',
  'agency_admin'
);

-- Client Admin for Client A
INSERT INTO users (auth0_sub, client_id, email, role)
VALUES (
  'auth0|CLIENT_ADMIN_AUTH0_SUB',
  '550e8400-e29b-41d4-a716-446655440001', -- Must match client_id in Auth0 metadata
  'admin.clienta@test.com',
  'client_admin'
);

-- Client User for Client A
INSERT INTO users (auth0_sub, client_id, email, role)
VALUES (
  'auth0|CLIENT_USER_AUTH0_SUB',
  '550e8400-e29b-41d4-a716-446655440001', -- Must match client_id in Auth0 metadata
  'user.clienta@test.com',
  'client_user'
);
```

**Important Notes:**
- `auth0_sub` must match the `sub` claim in the JWT token (format: `auth0|...`)
- `client_id` in database must match the `client_id` in Auth0 metadata
- `role` must match the role in Auth0 metadata

---

## 🔑 Getting JWT Tokens for Each Role

### For agency_admin

1. **Login via Auth0** with the agency_admin user
2. **Get token** from browser DevTools Network tab or Auth0 Dashboard
3. **Decode at jwt.io** and verify:
   - `role` claim = `"agency_admin"` (or `"https://trudy.ai/role": "agency_admin"`)
   - `client_id` claim present (can be any client ID)

### For client_admin

1. **Login via Auth0** with the client_admin user
2. **Get token** from browser DevTools Network tab or Auth0 Dashboard
3. **Decode at jwt.io** and verify:
   - `role` claim = `"client_admin"` (or `"https://trudy.ai/role": "client_admin"`)
   - `client_id` claim = UUID of their client (e.g., `"550e8400-e29b-41d4-a716-446655440001"`)

### For client_user

1. **Login via Auth0** with the client_user user
2. **Get token** from browser DevTools Network tab or Auth0 Dashboard
3. **Decode at jwt.io** and verify:
   - `role` claim = `"client_user"` (or `"https://trudy.ai/role": "client_user"`)
   - `client_id` claim = UUID of their client (e.g., `"550e8400-e29b-41d4-a716-446655440001"`)

---

## 🧪 Testing Scenarios

### Test Setup

Create Postman collections with these variables:

| Variable | agency_admin | client_admin | client_user |
|----------|--------------|--------------|-------------|
| `jwt_token` | Token with agency_admin role | Token with client_admin role | Token with client_user role |
| `client_id` | Any client UUID (optional) | Client A UUID | Client A UUID |

---

### Scenario 1: Testing `/api/v1/auth/me` Endpoint

#### Test 1.1: agency_admin without x-client-id
```http
GET /api/v1/auth/me
Authorization: Bearer {{jwt_token_agency_admin}}
```

**Expected Result:** ✅ 200 OK
- Should work even without `x-client-id` header
- Returns user info with role `agency_admin`

#### Test 1.2: client_admin without x-client-id
```http
GET /api/v1/auth/me
Authorization: Bearer {{jwt_token_client_admin}}
```

**Expected Result:** ❌ 401 Unauthorized
- Error: `"Missing x-client-id header"`

#### Test 1.3: client_admin with correct x-client-id
```http
GET /api/v1/auth/me
Authorization: Bearer {{jwt_token_client_admin}}
x-client-id: 550e8400-e29b-41d4-a716-446655440001
```

**Expected Result:** ✅ 200 OK
- Returns user info with role `client_admin`
- `client_id` matches the header

#### Test 1.4: client_admin with wrong x-client-id
```http
GET /api/v1/auth/me
Authorization: Bearer {{jwt_token_client_admin}}
x-client-id: 550e8400-e29b-41d4-a716-446655440002
```

**Expected Result:** ❌ 403 Forbidden
- Error: `"client_id mismatch"`

#### Test 1.5: client_user with x-client-id
```http
GET /api/v1/auth/me
Authorization: Bearer {{jwt_token_client_user}}
x-client-id: 550e8400-e29b-41d4-a716-446655440001
```

**Expected Result:** ✅ 200 OK
- Returns user info with role `client_user`

---

### Scenario 2: Testing `/api/v1/auth/clients` Endpoint

#### Test 2.1: agency_admin
```http
GET /api/v1/auth/clients
Authorization: Bearer {{jwt_token_agency_admin}}
```

**Expected Result:** ✅ 200 OK
- Returns **all clients** in the system

#### Test 2.2: client_admin
```http
GET /api/v1/auth/clients
Authorization: Bearer {{jwt_token_client_admin}}
x-client-id: 550e8400-e29b-41d4-a716-446655440001
```

**Expected Result:** ✅ 200 OK
- Returns **only their client** (Client A)

#### Test 2.3: client_user
```http
GET /api/v1/auth/clients
Authorization: Bearer {{jwt_token_client_user}}
x-client-id: 550e8400-e29b-41d4-a716-446655440001
```

**Expected Result:** ✅ 200 OK
- Returns **only their client** (Client A)

---

### Scenario 3: Testing Create Agent Endpoint

#### Test 3.1: agency_admin creating agent
```http
POST /api/v1/agents
Authorization: Bearer {{jwt_token_agency_admin}}
x-client-id: 550e8400-e29b-41d4-a716-446655440001
Content-Type: application/json

{
  "name": "Test Agent",
  "voice_id": "voice-uuid-here",
  "prompt": "You are a helpful assistant",
  "temperature": 0.7
}
```

**Expected Result:** ✅ 201 Created
- Agent created successfully

#### Test 3.2: client_admin creating agent
```http
POST /api/v1/agents
Authorization: Bearer {{jwt_token_client_admin}}
x-client-id: 550e8400-e29b-41d4-a716-446655440001
Content-Type: application/json

{
  "name": "Test Agent",
  "voice_id": "voice-uuid-here",
  "prompt": "You are a helpful assistant",
  "temperature": 0.7
}
```

**Expected Result:** ✅ 201 Created
- Agent created for their client

#### Test 3.3: client_user trying to create agent
```http
POST /api/v1/agents
Authorization: Bearer {{jwt_token_client_user}}
x-client-id: 550e8400-e29b-41d4-a716-446655440001
Content-Type: application/json

{
  "name": "Test Agent",
  "voice_id": "voice-uuid-here",
  "prompt": "You are a helpful assistant",
  "temperature": 0.7
}
```

**Expected Result:** ❌ 403 Forbidden
- Error: `"Insufficient permissions"`

---

### Scenario 4: Testing Admin Endpoints

#### Test 4.1: agency_admin accessing admin endpoint
```http
GET /api/admin/users/{user_id}/export
Authorization: Bearer {{jwt_token_agency_admin}}
```

**Expected Result:** ✅ 200 OK or 404 if user not found
- Admin endpoint accessible

#### Test 4.2: client_admin accessing admin endpoint
```http
GET /api/admin/users/{user_id}/export
Authorization: Bearer {{jwt_token_client_admin}}
x-client-id: 550e8400-e29b-41d4-a716-446655440001
```

**Expected Result:** ❌ 403 Forbidden
- Error: `"Admin access required"`

#### Test 4.3: client_user accessing admin endpoint
```http
GET /api/admin/users/{user_id}/export
Authorization: Bearer {{jwt_token_client_user}}
x-client-id: 550e8400-e29b-41d4-a716-446655440001
```

**Expected Result:** ❌ 403 Forbidden
- Error: `"Admin access required"`

---

### Scenario 5: Testing Cross-Client Access (Data Isolation)

#### Test 5.1: client_admin accessing Client B's resources
```http
GET /api/v1/agents
Authorization: Bearer {{jwt_token_client_admin}}  # Client A admin
x-client-id: 550e8400-e29b-41d4-a716-446655440002  # Client B ID
```

**Expected Result:** ❌ 403 Forbidden or Empty Results
- Should not see Client B's agents (RLS filtering)
- If `x-client-id` doesn't match JWT `client_id`: `"client_id mismatch"`

#### Test 5.2: agency_admin accessing any client's resources
```http
GET /api/v1/agents
Authorization: Bearer {{jwt_token_agency_admin}}
x-client-id: 550e8400-e29b-41d4-a716-446655440002  # Client B ID
```

**Expected Result:** ✅ 200 OK
- Can see Client B's agents

---

### Scenario 6: Testing Update/Delete Operations

#### Test 6.1: client_admin updating their agent
```http
PUT /api/v1/agents/{agent_id}
Authorization: Bearer {{jwt_token_client_admin}}
x-client-id: 550e8400-e29b-41d4-a716-446655440001
Content-Type: application/json

{
  "name": "Updated Agent Name"
}
```

**Expected Result:** ✅ 200 OK

#### Test 6.2: client_user trying to update agent
```http
PUT /api/v1/agents/{agent_id}
Authorization: Bearer {{jwt_token_client_user}}
x-client-id: 550e8400-e29b-41d4-a716-446655440001
Content-Type: application/json

{
  "name": "Updated Agent Name"
}
```

**Expected Result:** ❌ 403 Forbidden
- Error: `"Insufficient permissions"`

---

## ✅ Complete Test Checklist

### agency_admin Tests

- [ ] Can access `/api/v1/auth/me` without `x-client-id`
- [ ] Can access `/api/v1/auth/me` with `x-client-id` (any client)
- [ ] Can get all clients via `/api/v1/auth/clients`
- [ ] Can create agents for any client
- [ ] Can update agents for any client
- [ ] Can delete agents for any client
- [ ] Can create campaigns for any client
- [ ] Can access `/api/admin/*` endpoints
- [ ] Can see all clients' data (RLS bypassed)

### client_admin Tests

- [ ] ❌ Cannot access `/api/v1/auth/me` without `x-client-id` (401)
- [ ] ✅ Can access `/api/v1/auth/me` with correct `x-client-id`
- [ ] ❌ Cannot access `/api/v1/auth/me` with wrong `x-client-id` (403)
- [ ] ✅ Can get only their client via `/api/v1/auth/clients`
- [ ] ✅ Can create agents for their client
- [ ] ✅ Can update their own agents
- [ ] ✅ Can delete their own agents
- [ ] ✅ Can create campaigns for their client
- [ ] ✅ Can create voices for their client
- [ ] ✅ Can manage knowledge bases for their client
- [ ] ✅ Can manage tools for their client
- [ ] ❌ Cannot access `/api/admin/*` endpoints (403)
- [ ] ❌ Cannot see other clients' data (RLS filtering)

### client_user Tests

- [ ] ❌ Cannot access `/api/v1/auth/me` without `x-client-id` (401)
- [ ] ✅ Can access `/api/v1/auth/me` with correct `x-client-id`
- [ ] ✅ Can get only their client via `/api/v1/auth/clients`
- [ ] ✅ Can view agents (GET requests)
- [ ] ❌ Cannot create agents (403)
- [ ] ❌ Cannot update agents (403)
- [ ] ❌ Cannot delete agents (403)
- [ ] ✅ Can view campaigns (GET requests)
- [ ] ❌ Cannot create campaigns (403)
- [ ] ✅ Can view calls
- [ ] ❌ Cannot access `/api/admin/*` endpoints (403)

---

## 🔍 Troubleshooting

### Issue 1: "Missing x-client-id header" for non-admin users

**Solution:**
- Always include `x-client-id` header for `client_admin` and `client_user` roles
- Header value must be a valid UUID matching the JWT token's `client_id` claim

### Issue 2: "client_id mismatch"

**Solution:**
- Verify `x-client-id` header matches the `client_id` in JWT token
- Check Auth0 metadata: `app_metadata.client_id` or `user_metadata.client_id`
- Ensure database `users.client_id` matches Auth0 metadata

### Issue 3: Role not appearing in JWT token

**Solution:**
- Verify Auth0 Action/Rule is deployed and active
- Check user's `app_metadata` or `user_metadata` has `role` field
- Decode JWT at jwt.io to verify claims
- Check namespace: role might be `https://trudy.ai/role` instead of just `role`

### Issue 4: 403 Forbidden when should have access

**Solution:**
- Check role in JWT token matches database role
- Verify endpoint permissions (some require `client_admin` or `agency_admin`)
- Check RLS policies aren't blocking access

### Issue 5: Can't see other clients' data as agency_admin

**Solution:**
- Ensure role is exactly `agency_admin` (case-sensitive)
- Verify RLS policies allow `agency_admin` access
- Check JWT token has correct role claim

---

## 📝 Quick Reference

### Role Permissions Matrix

| Endpoint/Operation | agency_admin | client_admin | client_user |
|-------------------|--------------|--------------|-------------|
| GET `/api/v1/auth/me` | ✅ (no header) | ✅ (with header) | ✅ (with header) |
| GET `/api/v1/auth/clients` | ✅ All | ✅ Own | ✅ Own |
| POST `/api/v1/agents` | ✅ All | ✅ Own | ❌ |
| PUT `/api/v1/agents/{id}` | ✅ All | ✅ Own | ❌ |
| DELETE `/api/v1/agents/{id}` | ✅ All | ✅ Own | ❌ |
| GET `/api/v1/agents` | ✅ All | ✅ Own | ✅ Own |
| POST `/api/v1/campaigns` | ✅ All | ✅ Own | ❌ |
| POST `/api/v1/voices` | ✅ All | ✅ Own | ❌ |
| POST `/api/v1/kb` | ✅ All | ✅ Own | ❌ |
| POST `/api/v1/tools` | ✅ All | ✅ Own | ❌ |
| GET `/api/admin/*` | ✅ | ❌ | ❌ |
| `x-client-id` Required | ❌ | ✅ | ✅ |

---

## 🎯 Testing Tips

1. **Use Postman Collections**: Create separate folders for each role
2. **Save Variables**: Store tokens and client IDs in Postman environment variables
3. **Decode Tokens**: Always verify JWT claims at jwt.io before testing
4. **Test Edge Cases**: Try wrong client_id, missing headers, expired tokens
5. **Check Logs**: Backend logs will show role-based access decisions

---

## 📚 Related Documentation

- [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md) - General API testing guide
- [POSTMAN_QUICK_START.md](./POSTMAN_QUICK_START.md) - Quick setup guide
- [SETUP.md](./SETUP.md) - Initial setup instructions

---

**Last Updated:** 2025-01-XX
**Version:** 1.0

