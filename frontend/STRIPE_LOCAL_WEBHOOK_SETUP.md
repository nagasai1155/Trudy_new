# Stripe Webhook Setup for Local Development

## The Problem
Stripe cannot reach `http://localhost:8000` because it's not publicly accessible. You need to either:
1. Use Stripe CLI (recommended for local dev)
2. Use a tunneling service (ngrok, etc.)
3. Skip for now and set up when you have a public URL

## Option 1: Use Stripe CLI (Easiest for Local Testing)

### Step 1: Install Stripe CLI
- **Windows**: Download from https://github.com/stripe/stripe-cli/releases
- Or use package manager:
  ```powershell
  # Using Scoop (if installed)
  scoop install stripe
  
  # Or download .exe from GitHub releases
  ```

### Step 2: Login to Stripe CLI
```powershell
stripe login
```
This will open your browser to authenticate.

### Step 3: Forward Webhooks to Local Backend
```powershell
stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe
```

This will:
- Create a webhook endpoint automatically
- Give you a webhook signing secret (starts with `whsec_`)
- Forward all Stripe events to your local backend

### Step 4: Copy the Webhook Secret
When you run `stripe listen`, it will output something like:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

Copy this secret and add to your backend `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Step 5: In Stripe Dashboard
- You can skip creating the webhook endpoint in the dashboard for now
- The CLI handles it automatically
- When you deploy to production, create the webhook endpoint with your public URL

## Option 2: Use ngrok (Alternative)

### Step 1: Install ngrok
- Download from https://ngrok.com/download
- Or use: `choco install ngrok` (if you have Chocolatey)

### Step 2: Start ngrok tunnel
```powershell
ngrok http 8000
```

This will give you a public URL like: `https://abc123.ngrok.io`

### Step 3: Use ngrok URL in Stripe
- In Stripe webhook setup, use: `https://abc123.ngrok.io/api/v1/webhooks/stripe`
- Note: Free ngrok URLs change each time you restart

### Step 4: Get Webhook Secret
- After creating webhook in Stripe Dashboard
- Click on the webhook endpoint
- Copy the signing secret

## Option 3: Skip for Now (Development Only)

If you just want to test payments without webhooks:

1. **In Stripe Dashboard:**
   - Click "Cancel" on the webhook setup
   - You can create the webhook later when you have a public URL

2. **For now:**
   - Payments will still work
   - But credits won't be automatically added
   - You'll need to manually add credits or set up webhook later

3. **When ready for production:**
   - Deploy your backend to a public URL
   - Create webhook endpoint in Stripe Dashboard
   - Use your production URL: `https://your-api.com/api/v1/webhooks/stripe`

## Recommended Approach

**For Local Development:**
- Use **Stripe CLI** (Option 1) - easiest and most reliable

**For Production:**
- Create webhook endpoint in Stripe Dashboard
- Use your production backend URL
- Get webhook secret and add to production `.env`

## Quick Start with Stripe CLI

```powershell
# 1. Install Stripe CLI (download from GitHub)
# 2. Login
stripe login

# 3. Forward webhooks (run this in a separate terminal)
stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe

# 4. Copy the webhook secret it gives you
# 5. Add to z-backend/.env as STRIPE_WEBHOOK_SECRET
```

## Testing

1. Start your backend: `cd z-backend && uvicorn app.main:app --reload`
2. Start Stripe CLI forwarding: `stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe`
3. Make a test payment on `/billing` page
4. Check Stripe CLI terminal - you should see webhook events being forwarded
5. Check backend logs - you should see webhook being processed

