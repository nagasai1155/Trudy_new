# 🚀 Postman Quick Start - 5 Minute Setup

This is a super quick guide to get you testing the Trudy API in just 5 minutes!

---

## ✅ Step 1: Install Postman (2 minutes)

1. Go to [postman.com/downloads](https://www.postman.com/downloads/)
2. Download for Windows
3. Install and open Postman
4. Create a free account or skip for now

---

## ✅ Step 2: Import the Collection (30 seconds)

1. In Postman, click **Import** (top left)
2. Drag and drop `Trudy_API_Postman_Collection.json` file
3. Click **Import**
4. You'll see "Trudy Backend API" collection on the left

---

## ✅ Step 3: Set Your Variables (2 minutes)

1. Click on **"Trudy Backend API"** collection
2. Go to **Variables** tab
3. Fill in these values:

| Variable | Where to Get It | Example |
|----------|----------------|---------|
| `base_url` | Usually `http://localhost:8000` | `http://localhost:8000` |
| `jwt_token` | See below 👇 | `eyJhbGciOiJSUzI1Ni...` |
| `client_id` | See below 👇 | `550e8400-e29b-41d4-a716-446655440000` |

4. Click **Save**

### 🔑 Getting Your JWT Token

**Quick Method (Frontend Login):**
1. Open your Trudy frontend
2. Press `F12` to open DevTools
3. Go to **Network** tab
4. Log in to your app
5. Click on any API request
6. Look for **Authorization** header
7. Copy everything after "Bearer " (the long string starting with `eyJ`)

**Alternative (Auth0 Dashboard):**
1. Go to Auth0 Dashboard
2. Navigate to Applications → Your App → Test tab
3. Click "Get Token"
4. Copy the token

### 🆔 Getting Your Client ID

**Option 1 - From Postman:**
1. Once you have your JWT token
2. Run the "Get Current User" request
3. Copy the `client_id` from the response
4. Paste it into the collection variable

**Option 2 - From Database:**
1. Go to your Supabase dashboard
2. Go to Table Editor → `clients` table
3. Copy your client's `id` (UUID format)

---

## ✅ Step 4: Test the API (30 seconds)

### Test 1: Health Check
1. Expand "0. Health Check" folder
2. Click "Health Check"
3. Click **Send**
4. You should see: `{"status": "healthy", "service": "trudy-api"}`

✅ **If this works, your backend is running!**

### Test 2: Authenticate
1. Expand "1. Authentication" folder
2. Click "Get Current User"
3. Click **Send**
4. You should see your user info!

✅ **If this works, your authentication is set up correctly!**

---

## 🎯 What to Do Next?

Now you're ready to test everything! Follow this order:

### Recommended Testing Order:

1. **✅ Health Check** - Verify backend is running
2. **👤 Get Current User** - Verify authentication
3. **🎤 Create Voice** - Make a test voice
4. **🤖 Create Agent** - Make an agent with that voice
5. **📋 List Agents** - See your agents
6. **📢 Create Campaign** - Make a campaign
7. **➕ Add Contacts** - Add test contacts
8. **(Optional) Schedule Campaign** - ⚠️ This makes real calls!

---

## 💡 Pro Tips

### Tip 1: Save IDs Automatically
Each request that creates something (voice, agent, campaign) has a **Tests** tab that automatically saves the ID to your variables. You don't need to copy-paste manually!

### Tip 2: Check the Console
At the bottom of Postman, click **Console** to see all requests and responses. Great for debugging!

### Tip 3: Use Variables Everywhere
Instead of hardcoding IDs, use:
- `{{agent_id}}`
- `{{voice_id}}`
- `{{campaign_id}}`

These get automatically filled from your saved variables.

### Tip 4: Read Error Messages
If something fails, the error message usually tells you exactly what's wrong:
- `"Missing x-client-id header"` → Add the header
- `"Token expired"` → Get a new JWT token
- `"voice not found"` → Create a voice first

---

## 🆘 Common Issues

### "Connection Refused"
**Problem:** Backend isn't running

**Fix:**
```bash
cd z-backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### "401 Unauthorized"
**Problem:** Bad or expired token

**Fix:** Get a new JWT token and update the `jwt_token` variable

### "403 Forbidden"
**Problem:** You don't have permission

**Fix:** Make sure your user role is `client_admin` or `agency_admin`

### "404 Not Found"
**Problem:** The ID doesn't exist

**Fix:** Make sure you created the resource first (voice, agent, etc.)

---

## 📚 Need More Help?

- **Full Guide:** Read `POSTMAN_TESTING_GUIDE.md` for detailed explanations
- **API Docs:** Visit `http://localhost:8000/docs` for interactive API documentation
- **Backend Logs:** Check your terminal running the backend for error details

---

## 🎉 You're All Set!

You should now be able to:
- ✅ Make API requests
- ✅ Create agents and voices
- ✅ Manage campaigns
- ✅ View call details
- ✅ Test all endpoints

**Happy Testing!** 🚀

---

## Quick Reference

### All Requests Need These Headers:
```
Authorization: Bearer {{jwt_token}}
x-client-id: {{client_id}}
Content-Type: application/json
```

### Common Endpoints:
- Health: `GET /health`
- Auth: `GET /api/v1/auth/me`
- Voices: `POST /api/v1/voices`
- Agents: `POST /api/v1/agents`
- Campaigns: `POST /api/v1/campaigns`
- Calls: `POST /api/v1/calls`

### Variable Format:
- Use in URL: `{{base_url}}/api/v1/agents/{{agent_id}}`
- Use in Body: `{"agent_id": "{{agent_id}}"}`
- Auto-generate UUID: `{{$guid}}`

