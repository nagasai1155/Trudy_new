"""
AWS KMS Encryption Service for API Keys
"""
import logging
import boto3
from botocore.exceptions import ClientError, BotoCoreError
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Global KMS client
_kms_client = None


def get_kms_client():
    """Get or create KMS client"""
    global _kms_client
    
    if _kms_client is None:
        try:
            _kms_client = boto3.client(
                'kms',
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID if settings.AWS_ACCESS_KEY_ID else None,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY if settings.AWS_SECRET_ACCESS_KEY else None,
            )
        except Exception as e:
            logger.warning(f"Failed to create KMS client: {e}. Encryption will be disabled.")
            _kms_client = None
    
    return _kms_client


def encrypt_api_key(plaintext: str, key_id: Optional[str] = None) -> Optional[str]:
    """
    Encrypt API key using AWS KMS
    
    Args:
        plaintext: The API key to encrypt
        key_id: KMS key ID (optional, uses default if not provided)
    
    Returns:
        Encrypted ciphertext blob (base64 encoded) or None if encryption fails
    """
    if not plaintext:
        return None
    
    # If KMS is not configured, return plaintext (development mode)
    # In production, this should always use KMS
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_REGION:
        logger.warning("KMS not configured. Storing API key as plaintext (not recommended for production)")
        return plaintext
    
    kms_client = get_kms_client()
    if not kms_client:
        logger.error("KMS client not available. Storing API key as plaintext")
        return plaintext
    
    try:
        # Use default key ID from environment or parameter
        encryption_key_id = key_id or settings.AWS_REGION  # You should set KMS_KEY_ID in settings
        
        response = kms_client.encrypt(
            KeyId=encryption_key_id,
            Plaintext=plaintext.encode('utf-8'),
        )
        
        # Return base64 encoded ciphertext
        import base64
        ciphertext_blob = response['CiphertextBlob']
        return base64.b64encode(ciphertext_blob).decode('utf-8')
        
    except ClientError as e:
        logger.error(f"AWS KMS encryption error: {e}")
        return None
    except Exception as e:
        logger.error(f"Encryption error: {e}")
        return None


def decrypt_api_key(ciphertext: str, key_id: Optional[str] = None) -> Optional[str]:
    """
    Decrypt API key using AWS KMS
    
    Args:
        ciphertext: The encrypted API key (base64 encoded)
        key_id: KMS key ID (optional, uses default if not provided)
    
    Returns:
        Decrypted plaintext or None if decryption fails
    """
    if not ciphertext:
        return None
    
    # Check if it's plaintext (development mode)
    # In production, all keys should be encrypted
    if not ciphertext.startswith('AQICA'):  # KMS ciphertext typically starts with this
        logger.warning("API key appears to be plaintext (development mode)")
        return ciphertext
    
    # If KMS is not configured, return as-is (development mode)
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_REGION:
        return ciphertext
    
    kms_client = get_kms_client()
    if not kms_client:
        logger.error("KMS client not available. Cannot decrypt API key")
        return None
    
    try:
        import base64
        ciphertext_blob = base64.b64decode(ciphertext)
        
        # Use default key ID from environment or parameter
        encryption_key_id = key_id or settings.AWS_REGION  # You should set KMS_KEY_ID in settings
        
        response = kms_client.decrypt(
            CiphertextBlob=ciphertext_blob,
            KeyId=encryption_key_id,
        )
        
        return response['Plaintext'].decode('utf-8')
        
    except ClientError as e:
        logger.error(f"AWS KMS decryption error: {e}")
        return None
    except Exception as e:
        logger.error(f"Decryption error: {e}")
        return None

