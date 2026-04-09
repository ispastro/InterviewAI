"""
Upstash Redis Client Wrapper

Production-ready wrapper with:
- Automatic retries with exponential backoff
- Comprehensive error handling
- Metrics tracking
- Type safety
- Graceful degradation
"""

import json
import logging
from typing import Optional, Any, Dict, List

from upstash_redis.asyncio import Redis
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log
)

from app.config import settings

logger = logging.getLogger(__name__)


class UpstashRedisClient:
    """Production-grade Upstash Redis client."""
    
    def __init__(self):
        self.client: Optional[Redis] = None
        self.enabled = False
        self._metrics = {
            "hits": 0,
            "misses": 0,
            "errors": 0,
            "sets": 0,
            "deletes": 0
        }
        
        if settings.UPSTASH_REDIS_REST_URL and settings.UPSTASH_REDIS_REST_TOKEN:
            try:
                self.client = Redis(
                    url=settings.UPSTASH_REDIS_REST_URL,
                    token=settings.UPSTASH_REDIS_REST_TOKEN
                )
                self.enabled = True
                logger.info("✅ Upstash Redis initialized")
            except Exception as e:
                logger.error(f"❌ Redis init failed: {e}")
                self.enabled = False
        else:
            logger.warning("⚠️ Redis credentials missing - caching disabled")
    
    async def ping(self) -> bool:
        """Test connection."""
        if not self.enabled:
            return False
        try:
            result = await self.client.ping()
            return result == "PONG"
        except Exception as e:
            logger.error(f"Redis ping failed: {e}")
            return False
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=False
    )
    async def get(self, key: str) -> Optional[str]:
        """Get value from Redis."""
        if not self.enabled:
            return None
        
        try:
            value = await self.client.get(key)
            if value is not None:
                self._metrics["hits"] += 1
                logger.debug(f"Cache HIT: {key[:50]}...")
                return str(value) if value else None
            else:
                self._metrics["misses"] += 1
                logger.debug(f"Cache MISS: {key[:50]}...")
                return None
        except Exception as e:
            self._metrics["errors"] += 1
            logger.error(f"Redis GET error: {e}")
            return None
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=False
    )
    async def set(
        self,
        key: str,
        value: str,
        ex: Optional[int] = None,
        px: Optional[int] = None,
        nx: bool = False,
        xx: bool = False
    ) -> bool:
        """Set value in Redis."""
        if not self.enabled:
            return False
        
        try:
            options = {}
            if ex is not None:
                options["ex"] = ex
            if px is not None:
                options["px"] = px
            if nx:
                options["nx"] = True
            if xx:
                options["xx"] = True
            
            result = await self.client.set(key, value, **options)
            if result:
                self._metrics["sets"] += 1
                logger.debug(f"Cache SET: {key[:50]}... (TTL={ex or px or 'none'})")
                return True
            return False
        except Exception as e:
            self._metrics["errors"] += 1
            logger.error(f"Redis SET error: {e}")
            return False
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=False
    )
    async def delete(self, *keys: str) -> int:
        """Delete keys."""
        if not self.enabled or not keys:
            return 0
        
        try:
            result = await self.client.delete(*keys)
            self._metrics["deletes"] += len(keys)
            logger.debug(f"Cache DELETE: {len(keys)} keys")
            return result
        except Exception as e:
            self._metrics["errors"] += 1
            logger.error(f"Redis DELETE error: {e}")
            return 0
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=False
    )
    async def exists(self, *keys: str) -> int:
        """Check if keys exist."""
        if not self.enabled or not keys:
            return 0
        try:
            return await self.client.exists(*keys)
        except Exception as e:
            logger.error(f"Redis EXISTS error: {e}")
            return 0
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=False
    )
    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration."""
        if not self.enabled:
            return False
        try:
            result = await self.client.expire(key, seconds)
            return bool(result)
        except Exception as e:
            logger.error(f"Redis EXPIRE error: {e}")
            return False
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=False
    )
    async def incr(self, key: str) -> Optional[int]:
        """Increment key."""
        if not self.enabled:
            return None
        try:
            return await self.client.incr(key)
        except Exception as e:
            logger.error(f"Redis INCR error: {e}")
            return None
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=False
    )
    async def hset(self, key: str, mapping: Dict[str, Any]) -> int:
        """Set hash fields."""
        if not self.enabled:
            return 0
        try:
            str_mapping = {k: str(v) for k, v in mapping.items()}
            return await self.client.hset(key, mapping=str_mapping)
        except Exception as e:
            logger.error(f"Redis HSET error: {e}")
            return 0
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=False
    )
    async def hget(self, key: str, field: str) -> Optional[str]:
        """Get hash field."""
        if not self.enabled:
            return None
        try:
            value = await self.client.hget(key, field)
            return str(value) if value else None
        except Exception as e:
            logger.error(f"Redis HGET error: {e}")
            return None
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=False
    )
    async def hgetall(self, key: str) -> Dict[str, str]:
        """Get all hash fields."""
        if not self.enabled:
            return {}
        try:
            result = await self.client.hgetall(key)
            return {k: str(v) for k, v in result.items()} if result else {}
        except Exception as e:
            logger.error(f"Redis HGETALL error: {e}")
            return {}
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=False
    )
    async def keys(self, pattern: str) -> List[str]:
        """Find keys matching pattern."""
        if not self.enabled:
            return []
        try:
            result = await self.client.keys(pattern)
            return [str(k) for k in result] if result else []
        except Exception as e:
            logger.error(f"Redis KEYS error: {e}")
            return []
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get metrics."""
        total = self._metrics["hits"] + self._metrics["misses"]
        hit_rate = (self._metrics["hits"] / total * 100) if total > 0 else 0
        
        return {
            "enabled": self.enabled,
            "total_requests": total,
            "cache_hits": self._metrics["hits"],
            "cache_misses": self._metrics["misses"],
            "hit_rate_percent": round(hit_rate, 2),
            "sets": self._metrics["sets"],
            "deletes": self._metrics["deletes"],
            "errors": self._metrics["errors"]
        }
    
    def reset_metrics(self):
        """Reset metrics."""
        self._metrics = {"hits": 0, "misses": 0, "errors": 0, "sets": 0, "deletes": 0}


# Singleton
redis_client: Optional[UpstashRedisClient] = None


def get_redis() -> UpstashRedisClient:
    """Get Redis client instance."""
    global redis_client
    if redis_client is None:
        redis_client = UpstashRedisClient()
    return redis_client
