# Trudy AI Platform - Setup Guide

## Quick Start Guide

This guide will help you get the Trudy AI Platform up and running quickly.

## Step 1: Install Node.js

Make sure you have Node.js 18 or higher installed:

```bash
node --version
```

If not installed, download from [nodejs.org](https://nodejs.org/)

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages (~200 packages, ~500MB)

## Step 3: Configure Authentication

### Auth0 Setup

1. **Create Account**: Go to [auth0.com](https://auth0.com) and sign up
2. **Create Application**: 
   - Click "Applications" → "Create Application"
   - Name: "Trudy AI Platform"
   - Type: "Regular Web Application"
   - Click "Create"

3. **Get Credentials**:
   - Copy your "Domain" (e.g., `dev-abc123.us.auth0.com`)
   - Copy your "Client ID"
   - Copy your "Client Secret"

4. **Configure URLs**:
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`
   - Click "Save Changes"

## Step 4: Set Environment Variables

1. **Copy example file**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Generate Auth0 Secret**:
   ```bash
   openssl rand -hex 32
   ```
   Copy the output

3. **Edit .env.local**:
   ```env
   AUTH0_SECRET='<paste-generated-secret>'
   AUTH0_BASE_URL='http://localhost:3000'
   AUTH0_ISSUER_BASE_URL='https://<your-domain>.auth0.com'
   AUTH0_CLIENT_ID='<your-client-id>'
   AUTH0_CLIENT_SECRET='<your-client-secret>'
   
   NEXT_PUBLIC_API_URL='http://localhost:3000/api'
   ```

## Step 5: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 6: Test Authentication

1. Click "Login" - you should be redirected to Auth0
2. Create an account or login
3. You should be redirected back to the dashboard

## Common Issues

### Issue: "Module not found"
**Solution**: Run `npm install` again

### Issue: "Auth0 error"
**Solution**: Double-check your Auth0 credentials in `.env.local`

### Issue: "Port 3000 already in use"
**Solution**: Kill the process or use a different port:
```bash
npm run dev -- -p 3001
```

## Next Steps

### For Development:
- Explore the codebase in `src/`
- Check out the component library in `src/components/ui/`
- Review the types in `src/types/index.ts`

### For Production:
1. Set up API keys (see README.md)
2. Connect to backend API
3. Configure production Auth0 application
4. Deploy to Vercel

## API Keys Needed (Client to Provide)

The following services require API keys:

1. **UltraVox** - Voice AI platform
   - Website: [ultravox.ai](https://ultravox.ai)
   - Used for: Voice synthesis and call handling
   
2. **ElevenLabs** - Voice cloning
   - Website: [elevenlabs.io](https://elevenlabs.io)
   - Used for: Custom voice creation
   
3. **Telnyx** - Telephony
   - Website: [telnyx.com](https://telnyx.com)
   - Used for: Phone numbers and calling
   
4. **Supabase** - Backend/Database
   - Website: [supabase.com](https://supabase.com)
   - Used for: Data storage and real-time updates

## Project Structure Overview

```
src/
├── app/                    # Pages and routes
│   ├── (dashboard)/       # All main pages
│   └── api/               # API endpoints
├── components/            # UI components
│   ├── ui/               # Base components
│   └── layout/           # Layout components
├── lib/                  # Utilities
├── hooks/                # Custom hooks
├── stores/               # State management
└── types/                # TypeScript types
```

## Available Pages

- `/dashboard` - Overview and stats
- `/agents` - Manage AI agents
- `/campaigns` - Calling campaigns
- `/voice-cloning` - Custom voices
- `/analytics` - Reports and charts
- `/calls` - Call history
- `/contacts` - Contact management
- `/settings` - Configuration

## Development Tips

1. **Hot Reload**: Code changes reflect immediately
2. **Type Checking**: Run `npm run type-check`
3. **Linting**: Run `npm run lint`
4. **Components**: Use existing components from `src/components/ui/`

## Need Help?

- Check the main README.md
- Review the code comments
- Look at example pages in `src/app/(dashboard)/`

---

**You're all set! Happy coding! 🚀**

