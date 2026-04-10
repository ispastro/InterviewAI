

import hashlib
import hmac
import json
import logging
import time
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum

import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log
)

from app.config import settings

logger = logging.getLogger(__name__)


class JobStatus(str, Enum):
    
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"
    DEAD_LETTER = "dead_letter"


class JobPriority(str, Enum):
    
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


class QStashClient:
    
    
    def __init__(self):
        self.enabled = False
        self.base_url = "https://qstash.upstash.io/v2"
        self._metrics = {
            "published": 0,
            "scheduled": 0,
            "failed": 0,
            "retries": 0
        }
        
        # Check if QStash is configured
        if not hasattr(settings, 'QSTASH_TOKEN') or not settings.QSTASH_TOKEN:
            logger.warning("⚠️  QStash not configured - async jobs disabled")
            return
        
        if not hasattr(settings, 'QSTASH_CURRENT_SIGNING_KEY'):
            logger.warning("⚠️  QStash signing key not configured - signature verification disabled")
        
        if not hasattr(settings, 'API_BASE_URL') or not settings.API_BASE_URL:
            logger.error("❌ API_BASE_URL not configured - QStash cannot route webhooks")
            return
        
        self.token = settings.QSTASH_TOKEN
        self.signing_key = getattr(settings, 'QSTASH_CURRENT_SIGNING_KEY', None)
        self.next_signing_key = getattr(settings, 'QSTASH_NEXT_SIGNING_KEY', None)
        self.api_base_url = settings.API_BASE_URL
        
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            },
            timeout=30.0
        )
        
        self.enabled = True
        logger.info("✅ QStash client initialized")
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type(httpx.HTTPError),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True
    )
    async def publish(
        self,
        endpoint: str,
        payload: Dict[str, Any],
        retries: int = 3,
        delay: Optional[int] = None,
        priority: JobPriority = JobPriority.NORMAL,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        
        if not self.enabled:
            raise Exception("QStash is not enabled")
        
        # Build webhook URL
        webhook_url = f"{self.api_base_url}/webhooks/{endpoint}"
        
        # Build QStash headers
        qstash_headers = {
            "Upstash-Retries": str(retries),
            "Upstash-Forward-Priority": priority.value
        }
        
        if delay:
            qstash_headers["Upstash-Delay"] = f"{delay}s"
        
        if headers:
            # Forward custom headers to webhook
            for key, value in headers.items():
                qstash_headers[f"Upstash-Forward-{key}"] = value
        
        try:
            # Publish to QStash
            response = await self.client.post(
                f"/publish/{webhook_url}",
                json=payload,
                headers=qstash_headers
            )
            response.raise_for_status()
            
            result = response.json()
            message_id = result.get("messageId")
            
            self._metrics["published"] += 1
            logger.info(f"📤 Job published: {endpoint} (ID: {message_id}, retries: {retries})")
            
            return {
                "message_id": message_id,
                "endpoint": endpoint,
                "status": "published",
                "retries": retries,
                "delay": delay
            }
            
        except httpx.HTTPError as e:
            self._metrics["failed"] += 1
            logger.error(f"❌ QStash publish failed: {endpoint} - {str(e)}")
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type(httpx.HTTPError),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True
    )
    async def schedule(
        self,
        endpoint: str,
        payload: Dict[str, Any],
        cron: str,
        schedule_id: Optional[str] = None
    ) -> Dict[str, Any]:
        
        if not self.enabled:
            raise Exception("QStash is not enabled")
        
        webhook_url = f"{self.api_base_url}/webhooks/{endpoint}"
        
        schedule_data = {
            "destination": webhook_url,
            "cron": cron,
            "body": json.dumps(payload)
        }
        
        if schedule_id:
            schedule_data["scheduleId"] = schedule_id
        
        try:
            response = await self.client.post(
                "/schedules",
                json=schedule_data
            )
            response.raise_for_status()
            
            result = response.json()
            schedule_id = result.get("scheduleId")
            
            self._metrics["scheduled"] += 1
            logger.info(f"📅 Job scheduled: {endpoint} (ID: {schedule_id}, cron: {cron})")
            
            return {
                "schedule_id": schedule_id,
                "endpoint": endpoint,
                "cron": cron,
                "status": "scheduled"
            }
            
        except httpx.HTTPError as e:
            self._metrics["failed"] += 1
            logger.error(f"❌ QStash schedule failed: {endpoint} - {str(e)}")
            raise
    
    async def cancel_schedule(self, schedule_id: str) -> bool:
        
        if not self.enabled:
            return False
        
        try:
            response = await self.client.delete(f"/schedules/{schedule_id}")
            response.raise_for_status()
            
            logger.info(f"🗑️  Schedule cancelled: {schedule_id}")
            return True
            
        except httpx.HTTPError as e:
            logger.error(f"❌ Cancel schedule failed: {schedule_id} - {str(e)}")
            return False
    
    async def list_schedules(self) -> List[Dict[str, Any]]:
        
        if not self.enabled:
            return []
        
        try:
            response = await self.client.get("/schedules")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"❌ List schedules failed: {str(e)}")
            return []
    
    def verify_signature(
        self,
        signature: str,
        body: bytes,
        url: str,
        timestamp: Optional[str] = None
    ) -> bool:
        
        if not self.signing_key:
            logger.warning("⚠️  Signature verification skipped - signing key not configured")
            return True  # Allow in development
        
        try:
            # QStash sends signature in format: "v1=<signature>"
            if not signature.startswith("v1="):
                logger.error("❌ Invalid signature format")
                return False
            
            received_signature = signature[3:]  # Remove "v1=" prefix
            
            # Build signing string: timestamp.url.body
            if timestamp:
                signing_string = f"{timestamp}.{url}.{body.decode()}"
            else:
                signing_string = f"{url}.{body.decode()}"
            
            # Calculate expected signature
            expected_signature = hmac.new(
                self.signing_key.encode(),
                signing_string.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Try with next signing key (for key rotation)
            if not hmac.compare_digest(received_signature, expected_signature):
                if self.next_signing_key:
                    expected_signature_next = hmac.new(
                        self.next_signing_key.encode(),
                        signing_string.encode(),
                        hashlib.sha256
                    ).hexdigest()
                    
                    if hmac.compare_digest(received_signature, expected_signature_next):
                        logger.info("✅ Signature verified with next signing key")
                        return True
                
                logger.error("❌ Signature verification failed")
                return False
            
            logger.debug("✅ Signature verified")
            return True
            
        except Exception as e:
            logger.error(f"❌ Signature verification error: {str(e)}")
            return False
    
    async def get_metrics(self) -> Dict[str, Any]:
        
        return {
            "enabled": self.enabled,
            "jobs_published": self._metrics["published"],
            "jobs_scheduled": self._metrics["scheduled"],
            "jobs_failed": self._metrics["failed"],
            "retries": self._metrics["retries"]
        }
    
    def reset_metrics(self):
        
        self._metrics = {
            "published": 0,
            "scheduled": 0,
            "failed": 0,
            "retries": 0
        }
    
    async def close(self):
        
        if self.client:
            await self.client.aclose()


# Singleton instance
_qstash_client: Optional[QStashClient] = None


def get_qstash() -> QStashClient:
    
    global _qstash_client
    if _qstash_client is None:
        _qstash_client = QStashClient()
    return _qstash_client
