"""
S3 Utilities for Presigned URLs
"""
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from typing import Optional
import logging
from datetime import timedelta
from app.core.config import settings

logger = logging.getLogger(__name__)

# S3 client
_s3_client = None


def get_s3_client():
    """Get or create S3 client"""
    global _s3_client
    
    if _s3_client is None:
        config = Config(
            region_name=settings.AWS_REGION,
            retries={"max_attempts": 3, "mode": "standard"},
        )
        
        _s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            config=config,
        )
    
    return _s3_client


def generate_presigned_url(
    bucket: str,
    key: str,
    operation: str = "put_object",
    expires_in: int = 3600,
    content_type: Optional[str] = None,
) -> str:
    """
    Generate presigned URL for S3 operation
    
    Args:
        bucket: S3 bucket name
        key: S3 object key
        operation: S3 operation ("put_object", "get_object")
        expires_in: URL expiration in seconds
        content_type: Content type for PUT operations
    
    Returns:
        Presigned URL
    """
    try:
        s3_client = get_s3_client()
        
        params = {
            "Bucket": bucket,
            "Key": key,
        }
        
        if operation == "put_object" and content_type:
            params["ContentType"] = content_type
        
        url = s3_client.generate_presigned_url(
            operation,
            Params=params,
            ExpiresIn=expires_in,
        )
        
        return url
    except ClientError as e:
        logger.error(f"Error generating presigned URL: {e}")
        raise


def check_object_exists(bucket: str, key: str) -> bool:
    """Check if S3 object exists"""
    try:
        s3_client = get_s3_client()
        s3_client.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as e:
        if e.response["Error"]["Code"] == "404":
            return False
        raise


def upload_file_to_s3(
    bucket: str,
    key: str,
    file_path: str,
    content_type: Optional[str] = None,
) -> bool:
    """Upload file to S3"""
    try:
        s3_client = get_s3_client()
        
        extra_args = {}
        if content_type:
            extra_args["ContentType"] = content_type
        
        s3_client.upload_file(file_path, bucket, key, ExtraArgs=extra_args)
        return True
    except ClientError as e:
        logger.error(f"Error uploading file to S3: {e}")
        return False

