# Google OAuth Setup Guide

## Environment Variables Required

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
# Google OAuth Configuration
# Get these from Google Cloud Console: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth v5 Configuration
AUTH_SECRET=your_auth_secret_here
# Generate a secret: openssl rand -base64 32
# For production, use: https://generate-secret.vercel.app/32

AUTH_URL=http://localhost:3000
# For production, use your actual domain: https://yourdomain.com

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Steps to Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
   - Copy the Client ID and Client Secret
5. Paste the Client ID and Client Secret into your `.env.local` file

## Generate AUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

**Important**: In NextAuth v5, the environment variable is `AUTH_SECRET` (not `NEXTAUTH_SECRET`).

## After Setup

Once you've added the credentials to `.env.local`, restart your development server:
```bash
npm run dev
```

The Google OAuth sign-in should now work!

