"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "dev")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Trudy API"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://trudy.ai",
    ]
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    # Auth0
    JWT_AUDIENCE: str = os.getenv("JWT_AUDIENCE", "")
    JWT_ISSUER: str = os.getenv("JWT_ISSUER", "")
    JWT_ALGORITHM: str = "RS256"
    
    # AWS
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    S3_BUCKET_UPLOADS: str = os.getenv("S3_BUCKET_UPLOADS", "trudy-uploads")
    S3_BUCKET_RECORDINGS: str = os.getenv("S3_BUCKET_RECORDINGS", "trudy-recordings")
    
    # External APIs
    ULTRAVOX_API_KEY: str = os.getenv("ULTRAVOX_API_KEY", "")
    ULTRAVOX_BASE_URL: str = os.getenv("ULTRAVOX_BASE_URL", "https://api.ultravox.ai/v1")
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    TELNYX_API_KEY: str = os.getenv("TELNYX_API_KEY", "")
    
    # Webhooks
    ULTRAVOX_WEBHOOK_SECRET: str = os.getenv("ULTRAVOX_WEBHOOK_SECRET", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    TELNYX_WEBHOOK_SECRET: str = os.getenv("TELNYX_WEBHOOK_SECRET", "")
    WEBHOOK_SIGNING_SECRET: str = os.getenv("WEBHOOK_SIGNING_SECRET", "")
    
    # Secrets Manager (optional, for production)
    USE_SECRETS_MANAGER: bool = os.getenv("USE_SECRETS_MANAGER", "false").lower() == "true"
    SECRETS_MANAGER_SECRET_NAME: str = os.getenv("SECRETS_MANAGER_SECRET_NAME", "trudy/secrets")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    SENTRY_DSN: str = os.getenv("SENTRY_DSN", "")
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "100"))
    
    # Idempotency
    IDEMPOTENCY_TTL_DAYS: int = int(os.getenv("IDEMPOTENCY_TTL_DAYS", "7"))
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

