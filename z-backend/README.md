# Trudy Backend API

FastAPI backend for the Trudy voice AI calling platform. This backend integrates with Ultravox, Supabase, AWS S3, and other services.

## Architecture

- **Framework**: FastAPI (Python 3.11+)
- **Database**: Supabase Postgres with Row Level Security (RLS)
- **Storage**: AWS S3 for file uploads and recordings
- **External APIs**: Ultravox, Stripe, Telnyx
- **Authentication**: Auth0 JWT (RS256)

## Setup

### Prerequisites

- Python 3.11 or higher
- Supabase project (Postgres database)
- AWS account (S3 buckets)
- Auth0 application configured
- Ultravox API key

### Installation

1. **Clone the repository and navigate to backend directory:**
   ```bash
   cd z-backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the `z-backend` directory:
   ```env
   # Environment
   ENVIRONMENT=dev
   DEBUG=true

   # Supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key

   # Auth0
   JWT_AUDIENCE=https://your-api.com
   JWT_ISSUER=https://your-tenant.auth0.com/

   # AWS
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   S3_BUCKET_UPLOADS=trudy-uploads
   S3_BUCKET_RECORDINGS=trudy-recordings

   # External APIs
   ULTRAVOX_API_KEY=your-ultravox-key
   ULTRAVOX_BASE_URL=https://api.ultravox.ai/v1
   STRIPE_SECRET_KEY=your-stripe-secret
   TELNYX_API_KEY=your-telnyx-key

   # Webhooks
   ULTRAVOX_WEBHOOK_SECRET=your-ultravox-webhook-secret
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   TELNYX_WEBHOOK_SECRET=your-telnyx-webhook-secret
   WEBHOOK_SIGNING_SECRET=your-webhook-signing-secret

   # Logging
   LOG_LEVEL=INFO
   SENTRY_DSN=your-sentry-dsn  # Optional
   ```

### Database Setup

1. **Run the database migration in Supabase:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `database/migrations/001_initial_schema.sql`
   - Execute the SQL script

   This will create:
   - All required tables
   - Row Level Security (RLS) policies
   - Indexes
   - Triggers for `updated_at` and audit logging
   - Helper functions for JWT claims

2. **Verify RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```

3. **Test RLS policies:**
   - Create a test client and user
   - Test that users can only access their own client's data

## Running the Application

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/health`

### Production Mode

For production, use a proper ASGI server like Gunicorn with Uvicorn workers:

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## API Endpoints

### Authentication & Client Management
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/clients` - List clients
- `POST /api/v1/auth/api-keys` - Create API key
- `PATCH /api/v1/auth/providers/tts` - Configure TTS provider

### Voices
- `POST /api/v1/voices/files/presign` - Get presigned URLs for voice samples
- `POST /api/v1/voices` - Create voice (native clone or external reference)
- `GET /api/v1/voices` - List voices
- `GET /api/v1/voices/{id}` - Get voice

### Agents
- `POST /api/v1/agents` - Create agent
- `PATCH /api/v1/agents/{id}` - Update agent
- `GET /api/v1/agents` - List agents
- `GET /api/v1/agents/{id}` - Get agent

### Knowledge Bases
- `POST /api/v1/kb` - Create knowledge base
- `POST /api/v1/kb/{id}/files/presign` - Get presigned URLs for KB files
- `POST /api/v1/kb/{id}/files/ingest` - Ingest files into knowledge base
- `GET /api/v1/kb/{id}` - Get knowledge base

### Calls
- `POST /api/v1/calls` - Create call
- `GET /api/v1/calls/{id}` - Get call
- `GET /api/v1/calls/{id}/transcript` - Get call transcript
- `GET /api/v1/calls/{id}/recording` - Get call recording URL

### Campaigns
- `POST /api/v1/campaigns` - Create campaign
- `POST /api/v1/campaigns/{id}/contacts/presign` - Get presigned URL for contacts CSV
- `POST /api/v1/campaigns/{id}/contacts` - Upload campaign contacts
- `POST /api/v1/campaigns/{id}/schedule` - Schedule campaign
- `GET /api/v1/campaigns/{id}` - Get campaign

### Webhooks
- `POST /api/v1/webhooks/ultravox` - Ultravox webhook ingress
- `POST /api/v1/webhooks/stripe` - Stripe webhook ingress
- `POST /api/v1/webhooks` - Create webhook endpoint (egress)
- `GET /api/v1/webhooks` - List webhook endpoints
- `DELETE /api/v1/webhooks/{id}` - Delete webhook endpoint

### Tools
- `POST /api/v1/tools` - Create tool
- `GET /api/v1/tools` - List tools

## Request Headers

All authenticated requests require:
```
Authorization: Bearer {JWT_TOKEN}
x-client-id: {CLIENT_ID}
Content-Type: application/json
X-Idempotency-Key: {UUID}  # Optional, for POST/PUT requests
```

## Response Format

### Success Response
```json
{
  "data": {...},
  "meta": {
    "request_id": "req_...",
    "ts": "2025-10-19T10:00:00Z"
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {...},
    "request_id": "req_...",
    "ts": "2025-10-19T10:00:00Z"
  }
}
```

## Database Schema

The database schema includes:

- **clients** - Tenant/client accounts
- **users** - User accounts linked to Auth0
- **api_keys** - Encrypted API keys for external services
- **voices** - Voice configurations
- **agents** - AI agent configurations
- **knowledge_documents** - Knowledge base containers
- **knowledge_base_documents** - Individual files in knowledge bases
- **tools** - Tool integrations
- **calls** - Call records
- **campaigns** - Campaign configurations
- **campaign_contacts** - Contacts in campaigns
- **credit_transactions** - Credit purchase/spend records
- **webhook_endpoints** - Client webhook endpoints
- **webhook_deliveries** - Webhook delivery tracking
- **idempotency_keys** - Idempotency key cache
- **audit_log** - Audit trail

All tables have Row Level Security (RLS) enabled to enforce client-level data isolation.

## Testing

Run tests:
```bash
pytest
```

## Code Quality

Format code:
```bash
black app/
```

Lint code:
```bash
ruff check app/
```

Type check:
```bash
mypy app/
```

## Deployment

### AWS Lambda (Serverless)

For AWS Lambda deployment, use Mangum adapter:

```python
from mangum import Mangum
from app.main import app

handler = Mangum(app)
```

### Environment Variables

Set all required environment variables in your deployment platform:
- AWS Lambda: Environment variables
- AWS Secrets Manager: For production secrets
- Supabase: Database connection settings

## Security Notes

1. **API Keys**: Should be encrypted using AWS KMS (TODO: implement encryption)
2. **JWT Validation**: JWKs are cached for performance
3. **RLS**: All database queries are automatically filtered by client_id
4. **Webhooks**: HMAC signature verification for all webhooks
5. **Idempotency**: Prevents duplicate operations

## Troubleshooting

### RLS Issues
If RLS policies are blocking queries:
1. Verify JWT token includes `client_id` claim
2. Check that `supabase.postgrest.auth.set_auth(jwt_token)` is called
3. Verify RLS policies are enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`

### Ultravox API Errors
- Check API key is valid
- Verify network connectivity
- Check rate limits (429 errors trigger retry logic)

### S3 Presigned URLs
- Verify AWS credentials are correct
- Check bucket permissions
- Ensure bucket exists in the specified region

## Next Steps

1. **Implement encryption for API keys** (AWS KMS)
2. **Add Step Functions for async workflows**
3. **Implement idempotency key checking**
4. **Add comprehensive tests**
5. **Set up monitoring and alerting**
6. **Configure rate limiting**
7. **Implement webhook delivery queue (SQS)**

## Support

For issues or questions, please refer to the main project documentation or contact the development team.

