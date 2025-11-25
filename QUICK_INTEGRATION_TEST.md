# 🚀 Quick Integration Test - 5 Minute Check

## Step 1: Start Both Services (2 minutes)

### Terminal 1 - Backend:
```bash
cd z-backend
uvicorn app.main:app --reload --port 8000
```
✅ **Check**: Open http://localhost:8000/docs - Should see Swagger UI

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
✅ **Check**: Open http://localhost:3000 - Should see login page

---

## Step 2: Test Authentication (1 minute)

1. **Click "Sign In"** on frontend
2. **Log in with Google**
3. **Check browser console** (F12) - Should see no errors
4. **Check Network tab** - Should see request to `/api/v1/auth/me`

✅ **Success if**: You're redirected to dashboard after login

---

## Step 3: Test API Call (1 minute)

1. **Navigate to `/agents` page**
2. **Open DevTools** (F12) → **Network tab**
3. **Look for request** to `/api/v1/agents`
4. **Click on the request** → **Headers tab**

✅ **Check these headers exist:**
- [ ] `Authorization: Bearer ...` (has token)
- [ ] `x-client-id: ...` (has client ID)
- [ ] `X-Request-Id: ...` (has request ID)

✅ **Check Response:**
- [ ] Status: `200 OK`
- [ ] Response has `{data: [...], meta: {...}}` format

---

## Step 4: Test Data Display (1 minute)

1. **On `/agents` page**, check if:
   - [ ] Agents are displayed (or "No agents" message)
   - [ ] No errors in console
   - [ ] Loading state works (if data is loading)

✅ **Success if**: Page shows agents from backend OR shows empty state without errors

---

## ✅ Integration Status

### If all checks pass:
🎉 **Integration is working!** Backend and frontend are connected.

### If checks fail:

**❌ CORS Error:**
- Check backend `.env` has `CORS_ORIGINS=http://localhost:3000`
- Restart backend

**❌ 401 Unauthorized:**
- Check if you're logged in
- Check token in Network tab headers
- Verify JWT configuration

**❌ No data loading:**
- Check Network tab for API calls
- Verify backend is returning data
- Check browser console for errors

**❌ Missing headers:**
- Check `useAuthClient()` is being called
- Verify clientId is being set
- Check `AuthProvider` is in providers

---

## 🔍 Quick Debug Commands

### Check Backend Health:
```bash
curl http://localhost:8000/health
```

### Check Frontend API URL:
```bash
# In browser console:
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Test API Manually (after login):
```javascript
// In browser console:
fetch('http://localhost:8000/api/v1/agents', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'x-client-id': 'YOUR_CLIENT_ID'
  }
}).then(r => r.json()).then(console.log)
```

---

## 📋 Full Testing Guide

For detailed testing procedures, see: **`INTEGRATION_TESTING_GUIDE.md`**

