# Sentry Setup Guide

This guide will help you set up Sentry error monitoring for your Next.js application.

## What is Sentry?

Sentry is an error tracking and performance monitoring tool that helps you:
- Track errors and exceptions in real-time
- Monitor application performance
- Get detailed stack traces and context
- Set up alerts for critical issues
- Replay user sessions to debug issues

## Step 1: Create a Sentry Account

1. Go to [https://sentry.io/signup/](https://sentry.io/signup/)
2. Sign up for a free account (or use your existing account)
3. Create a new organization (or use an existing one)

## Step 2: Create a New Project

1. After logging in, click **"Create Project"** or go to your organization dashboard
2. Select **"Next.js"** as your platform
3. Give your project a name (e.g., "Trudy Frontend")
4. Click **"Create Project"**

## Step 3: Get Your Sentry Keys

After creating the project, Sentry will show you a setup page with your DSN (Data Source Name). You'll need:

### Required Keys:

1. **DSN (Data Source Name)**
   - This is the main key you need
   - Format: `https://[key]@[org].ingest.sentry.io/[project-id]`
   - You'll use this for both `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`

2. **Organization Slug**
   
   **Method 1: From URL (Easiest)**
   - Look at your browser's address bar when you're on Sentry
   - The URL will look like: `https://sentry.io/organizations/YOUR-ORG-SLUG-HERE/`
   - The part after `/organizations/` and before the next `/` is your organization slug
   - Example: If URL is `https://sentry.io/organizations/my-company/`, slug is `my-company`
   
   **Method 2: From Settings**
   - Click your profile icon (top right) → **Settings**
   - In the left sidebar, click **Organization Settings** → **General**
   - Look for **Organization Slug** field
   - Copy that value

3. **Project Slug**
   
   **Method 1: From URL (Easiest)**
   - When viewing your project in Sentry, look at the browser address bar
   - The URL will look like: `https://sentry.io/organizations/[org]/projects/YOUR-PROJECT-SLUG-HERE/`
   - The part after `/projects/` and before the next `/` is your project slug
   - Example: If URL is `https://sentry.io/organizations/my-company/projects/trudy-frontend/`, slug is `trudy-frontend`
   
   **Method 2: From Project Settings**
   - Go to your project in Sentry
   - Click the **Settings** icon (⚙️ gear icon) in the left sidebar
   - Click **General** (should be the first option)
   - Look for **Project Slug** field
   - Copy that value

### Optional (for Source Maps):

4. **Auth Token** (only if you want automatic source map uploads)
   - Go to: [https://sentry.io/settings/account/api/auth-tokens/](https://sentry.io/settings/account/api/auth-tokens/)
   - Click **"Create New Token"**
   - Give it a name (e.g., "Trudy Frontend Source Maps")
   - Select scopes: `project:releases` and `org:read`
   - Copy the token (you won't see it again!)

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Sentry values:

   ```env
   # Use the same DSN for both (client and server)
   SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id
   NEXT_PUBLIC_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id
   
   # Your organization and project slugs
   SENTRY_ORG=your-org-slug
   SENTRY_PROJECT=your-project-slug
   
   # Optional: Only if you want source maps
   SENTRY_AUTH_TOKEN=your-auth-token-here
   ```

## Step 5: Test the Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. To test if Sentry is working, you can temporarily add a test error in your code:
   ```typescript
   // In any component or API route
   throw new Error('Test Sentry Error')
   ```

3. Check your Sentry dashboard - you should see the error appear within a few seconds!

4. **Remove the test error** after confirming it works.

## Configuration Files

The following files have been set up for Sentry:

- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime (middleware) error tracking
- `src/instrumentation.ts` - Automatic initialization
- `next.config.js` - Webpack plugin for source maps

## Features Enabled

✅ **Error Tracking** - All errors are automatically captured
✅ **Performance Monitoring** - Track slow API routes and database queries
✅ **Session Replay** - Record user sessions to debug issues (10% sample rate)
✅ **Source Maps** - See original code in error stack traces
✅ **Release Tracking** - Track which version of your app has errors

## Adjusting Settings

### Change Error Sampling Rate

Edit `sentry.client.config.ts` and `sentry.server.config.ts`:
```typescript
tracesSampleRate: 1, // 100% of transactions (change to 0.1 for 10%)
```

### Change Session Replay Rate

Edit `sentry.client.config.ts`:
```typescript
replaysSessionSampleRate: 0.1, // 10% of sessions (change to 1.0 for 100%)
```

### Disable in Development

You can conditionally disable Sentry in development:
```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  // ...
})
```

## Troubleshooting

### Errors not appearing in Sentry?

1. Check that your DSN is correct in `.env.local`
2. Make sure you've restarted your dev server after adding env variables
3. Check the browser console for any Sentry initialization errors
4. Verify your Sentry project is active

### Source maps not working?

1. Make sure `SENTRY_AUTH_TOKEN` is set
2. Check that `SENTRY_ORG` and `SENTRY_PROJECT` are correct
3. Run `npm run build` to upload source maps
4. Check Sentry project settings → Source Maps

### Need Help?

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Support](https://sentry.io/support/)

## Security Notes

⚠️ **Important**: Never commit your `.env.local` file to git. It contains sensitive keys.

The `.env.example` file is safe to commit as it only contains placeholder values.

