"""
LLM Cache Manager

Provides intelligent caching for LLM responses with:
- Content-based cache keys (SHA256 hash)
- Automatic TTL management
- Namespace isolation
- Metrics tracking
"""

import hashlib
import json
import logging
from typing import Optional, Dict, Any

from app.integrations.upstash import get_redis
from app.config import settings

logger = logging.getLogger(__name__)


class LLMCacheManager:
    """
    Cache manager for LLM responses.
    
    Features:
    - Smart cache key generation (hash of prompt + params)
    - Namespace isolation (llm:cache:*)
    - Automatic TTL
    - Graceful degradation
    
    Usage:
        cache = LLMCacheManager()
        
        # Check cache
        cached = await cache.get(prompt="Analyze CV", temperature=0.3)
        if cached:
            return cached
        
        # Call LLM
        response = await llm_api.call(prompt)
        
        # Store in cache
        await cache.set(prompt="Analyze CV", response=response, ttl=7200)
    """
    
    def __init__(self):
        self.redis = get_redis()
        self.namespace = "llm:cache"
        self.default_ttl = settings.CACHE_TTL_SECONDS
    
    def _generate_cache_key(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        model: Optional[str] = None
    ) -> str:
        """
        Generate deterministic cache key from request parameters.
        
        Same inputs → same key → cache hit
        Different inputs → different key → cache miss
        
        Args:
            prompt: User prompt
            system_prompt: System prompt
            temperature: Temperature setting
            max_tokens: Max tokens
            model: Model name
            
        Returns:
            Cache key (e.g., "llm:cache:abc123...")
        """
        # Build deterministic dict
        cache_data = {
            "prompt": prompt,
            "system_prompt": system_prompt or "",
            "temperature": temperature or 0.0,
            "max_tokens": max_tokens or 0,
            "model": model or settings.GROQ_MODEL
        }
        
        # Sort keys for consistency
        cache_string = json.dumps(cache_data, sort_keys=True)
        
        # Generate SHA256 hash
        cache_hash = hashlib.sha256(cache_string.encode()).hexdigest()
        
        # Return namespaced key
        return f"{self.namespace}:{cache_hash}"
    
    async def get(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        model: Optional[str] = None
    ) -> Optional[str]:
        """
        Get cached LLM response.
        
        Args:
            prompt: User prompt
            system_prompt: System prompt
            temperature: Temperature
            max_tokens: Max tokens
            model: Model name
            
        Returns:
            Cached response or None
        """
        if not self.redis.enabled:
            return None
        
        cache_key = self._generate_cache_key(
            prompt, system_prompt, temperature, max_tokens, model
        )
        
        cached_value = await self.redis.get(cache_key)
        
        if cached_value:
            logger.info(f"LLM Cache HIT: {cache_key[:30]}...")
            return cached_value
        
        logger.debug(f"LLM Cache MISS: {cache_key[:30]}...")
        return None
    
    async def set(
        self,
        prompt: str,
        response: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        model: Optional[str] = None,
        ttl: Optional[int] = None
    ) -> bool:
        """
        Store LLM response in cache.
        
        Args:
            prompt: User prompt
            response: LLM response to cache
            system_prompt: System prompt
            temperature: Temperature
            max_tokens: Max tokens
            model: Model name
            ttl: Time-to-live in seconds (uses default if None)
            
        Returns:
            True if cached successfully
        """
        if not self.redis.enabled:
            return False
        
        cache_key = self._generate_cache_key(
            prompt, system_prompt, temperature, max_tokens, model
        )
        
        expiry = ttl or self.default_ttl
        
        success = await self.redis.set(cache_key, response, ex=expiry)
        
        if success:
            logger.info(f"LLM Cache SET: {cache_key[:30]}... (TTL={expiry}s)")
        
        return success
    
    async def delete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        model: Optional[str] = None
    ) -> bool:
        """
        Delete specific cached response.
        
        Args:
            prompt: User prompt
            system_prompt: System prompt
            temperature: Temperature
            max_tokens: Max tokens
            model: Model name
            
        Returns:
            True if deleted
        """
        if not self.redis.enabled:
            return False
        
        cache_key = self._generate_cache_key(
            prompt, system_prompt, temperature, max_tokens, model
        )
        
        result = await self.redis.delete(cache_key)
        return result > 0
    
    async def clear_all(self) -> int:
        """
        Clear all LLM cache entries.
        
        Returns:
            Number of keys deleted
        """
        if not self.redis.enabled:
            return 0
        
        # Find all cache keys
        keys = await self.redis.keys(f"{self.namespace}:*")
        
        if keys:
            deleted = await self.redis.delete(*keys)
            logger.info(f"LLM Cache CLEAR: deleted {deleted} keys")
            return deleted
        
        return 0
    
    async def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dict with cache stats
        """
        if not self.redis.enabled:
            return {
                "enabled": False,
                "message": "Cache is disabled"
            }
        
        # Get Redis metrics
        redis_metrics = await self.redis.get_metrics()
        
        # Count LLM cache keys
        keys = await self.redis.keys(f"{self.namespace}:*")
        
        return {
            "enabled": True,
            "llm_cache_keys": len(keys),
            "default_ttl_seconds": self.default_ttl,
            **redis_metrics
        }


# Singleton
_llm_cache: Optional[LLMCacheManager] = None


def get_llm_cache() -> LLMCacheManager:
    """Get LLM cache manager instance."""
    global _llm_cache
    if _llm_cache is None:
        _llm_cache = LLMCacheManager()
    return _llm_cache
