# Required API Keys and Configuration

This document lists all the API keys and external service configurations required for the Trudy platform to function properly.

## Backend Environment Variables

The backend requires the following environment variables. Create a `.env` file in the `z-backend` directory with these values:

### Core Infrastructure

```bash
# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Auth0 Configuration
JWT_AUDIENCE=https://your-api-audience
JWT_ISSUER=https://your-auth0-domain.auth0.com/

# AWS Configuration (for S3 uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_UPLOADS=trudy-uploads
S3_BUCKET_RECORDINGS=trudy-recordings
KMS_KEY_ID=your-kms-key-id  # Optional, for encryption
```

### External API Keys (Required)

#### 1. Ultravox API Key ⚠️ **REQUIRED**
- **Purpose**: Primary voice AI and calling provider
- **Where to get**: Sign up at https://ultravox.ai
- **Usage**: Voice cloning, agent creation, call management
- **Environment Variable**: `ULTRAVOX_API_KEY`
- **Status**: **CRITICAL** - Platform cannot function without this

```bash
ULTRAVOX_API_KEY=your-ultravox-api-key
ULTRAVOX_BASE_URL=https://api.ultravox.ai/v1
ULTRAVOX_WEBHOOK_SECRET=your-webhook-secret
```

#### 2. Stripe API Key (Optional but Recommended)
- **Purpose**: Payment processing and credit management
- **Where to get**: https://dashboard.stripe.com/apikeys
- **Usage**: Billing, credit purchases, subscription management
- **Environment Variable**: `STRIPE_SECRET_KEY`

```bash
STRIPE_SECRET_KEY=sk_test_...  # or sk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 3. Telnyx API Key (Optional)
- **Purpose**: Telephony provider (alternative to Ultravox for phone numbers)
- **Where to get**: https://portal.telnyx.com/
- **Usage**: Phone number management, call routing
- **Environment Variable**: `TELNYX_API_KEY`

```bash
TELNYX_API_KEY=your-telnyx-api-key
TELNYX_WEBHOOK_SECRET=your-webhook-secret
```

### Optional TTS Provider API Keys

These are configured per-client through the API, not as environment variables. Users can add these in the Settings/Providers section:

#### 4. ElevenLabs API Key (Optional)
- **Purpose**: Alternative TTS provider for voice cloning
- **Where to get**: https://elevenlabs.io/
- **Usage**: Custom voice generation
- **Configuration**: Set via `PATCH /api/v1/providers/tts` endpoint

#### 5. Google Cloud TTS API Key (Optional)
- **Purpose**: Google Cloud Text-to-Speech
- **Where to get**: https://console.cloud.google.com/
- **Usage**: High-quality TTS voices
- **Configuration**: Set via `PATCH /api/v1/providers/tts` endpoint
- **Additional Settings**: `project_id`, `region`

#### 6. AWS Polly (Optional)
- **Purpose**: Amazon Polly Text-to-Speech
- **Where to get**: AWS Console
- **Usage**: AWS-native TTS
- **Configuration**: Set via `PATCH /api/v1/providers/tts` endpoint

#### 7. Azure Cognitive Services (Optional)
- **Purpose**: Microsoft Azure Text-to-Speech
- **Where to get**: Azure Portal
- **Usage**: Azure TTS voices
- **Configuration**: Set via `PATCH /api/v1/providers/tts` endpoint

#### 8. OpenAI API Key (Optional)
- **Purpose**: OpenAI TTS models
- **Where to get**: https://platform.openai.com/
- **Usage**: OpenAI voice models
- **Configuration**: Set via `PATCH /api/v1/providers/tts` endpoint

### Monitoring & Observability (Optional)

```bash
# Sentry (Error Tracking)
SENTRY_DSN=https://your-sentry-dsn

# Logging
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
```

### Internal Configuration

```bash
# Environment
ENVIRONMENT=dev  # dev, staging, prod
DEBUG=false

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=100

# Idempotency
IDEMPOTENCY_TTL_DAYS=7

# Internal API (for Step Functions, webhooks)
INTERNAL_API_KEY=your-internal-api-key

# EventBridge (for async events)
EVENTBRIDGE_ENABLED=true
EVENTBRIDGE_SOURCE=trudy-backend

# Webhook Signing
WEBHOOK_SIGNING_SECRET=your-webhook-signing-secret
```

## Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Auth0 Configuration
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
```

## Setup Priority

### Minimum Required (Platform Won't Work Without)
1. ✅ **Ultravox API Key** - Core functionality
2. ✅ **Supabase** - Database
3. ✅ **Auth0** - Authentication
4. ✅ **AWS S3** - File uploads

### Recommended for Production
5. ✅ **Stripe** - Payment processing
6. ✅ **Sentry** - Error monitoring

### Optional (Nice to Have)
7. ⚪ **Telnyx** - Additional telephony
8. ⚪ **ElevenLabs/Google/AWS/Azure/OpenAI** - Alternative TTS providers

## How to Configure API Keys

### Backend Keys (Environment Variables)
1. Navigate to `z-backend` directory
2. Create `.env` file
3. Add all required variables
4. Restart backend server

### Client-Specific Keys (Per-User Configuration)
1. User logs into frontend
2. Navigate to Settings → API Keys
3. Add provider-specific keys (ElevenLabs, Google, etc.)
4. Keys are encrypted and stored per-client in database

## Security Notes

- ⚠️ **Never commit `.env` files to git**
- ⚠️ **Use different keys for dev/staging/production**
- ⚠️ **Rotate keys regularly**
- ⚠️ **Use AWS Secrets Manager in production** (set `USE_SECRETS_MANAGER=true`)

## Testing Without All Keys

You can test the platform with minimal configuration:
- ✅ Backend will start with just Supabase + Auth0
- ⚠️ Voice features require Ultravox key
- ⚠️ File uploads require AWS S3
- ⚠️ Payments require Stripe

## Getting Help

If you need help obtaining any of these API keys:
1. Check the provider's documentation
2. Contact support for the specific service
3. Review the backend logs for specific error messages

