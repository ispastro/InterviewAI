import json
import hashlib
import logging
from typing import Dict, Any, Optional
from datetime import timedelta

logger = logging.getLogger(__name__)


class LLMCache:
    """
    Cache layer for LLM responses to avoid redundant API calls.
    
    Features:
    - Redis-based caching with TTL
    - Smart cache key generation (hash of prompt + settings)
    - Graceful fallback (works without Redis)
    - Async operations
    """
    
    def __init__(self, redis_client=None, default_ttl: int = 3600):
        """
        Initialize the cache.
        
        Args:
            redis_client: Optional Redis client (if None, cache is disabled)
            default_ttl: Default time-to-live in seconds (default: 1 hour)
        """
        self.redis = redis_client
        self.default_ttl = default_ttl
        self.enabled = redis_client is not None
        
        if not self.enabled:
            logger.warning("LLM Cache initialized without Redis - caching disabled")
        else:
            logger.info(f"LLM Cache initialized with TTL={default_ttl}s")
    
    def _generate_cache_key(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        model: Optional[str] = None
    ) -> str:
        """
        Generate a unique cache key based on request parameters.
        
        Uses SHA256 hash of all parameters to create a consistent key.
        Same inputs = same key = cache hit.
        
        Args:
            prompt: The user prompt
            system_prompt: Optional system prompt
            temperature: Temperature setting
            max_tokens: Max tokens setting
            model: Model name
            
        Returns:
            Cache key string (e.g., "llm:cache:abc123...")
        """
        # Build a deterministic string from all parameters
        cache_data = {
            "prompt": prompt,
            "system_prompt": system_prompt or "",
            "temperature": temperature or 0.0,
            "max_tokens": max_tokens or 0,
            "model": model or ""
        }
        
        # Sort keys for consistency
        cache_string = json.dumps(cache_data, sort_keys=True)
        
        # Generate SHA256 hash
        cache_hash = hashlib.sha256(cache_string.encode()).hexdigest()
        
        # Return namespaced key
        return f"llm:cache:{cache_hash}"
    
    async def get(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        model: Optional[str] = None
    ) -> Optional[str]:
        """
        Get cached response if it exists.
        
        Args:
            prompt: The user prompt
            system_prompt: Optional system prompt
            temperature: Temperature setting
            max_tokens: Max tokens setting
            model: Model name
            
        Returns:
            Cached response string or None if not found
        """
        if not self.enabled:
            return None
        
        try:
            cache_key = self._generate_cache_key(
                prompt, system_prompt, temperature, max_tokens, model
            )
            
            # Get from Redis
            cached_value = await self.redis.get(cache_key)
            
            if cached_value:
                logger.info(f"Cache HIT for key: {cache_key[:20]}...")
                return cached_value.decode('utf-8') if isinstance(cached_value, bytes) else cached_value
            
            logger.debug(f"Cache MISS for key: {cache_key[:20]}...")
            return None
            
        except Exception as e:
            logger.error(f"Cache GET error: {str(e)}")
            # Graceful degradation - return None on error
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
        Store response in cache.
        
        Args:
            prompt: The user prompt
            response: The LLM response to cache
            system_prompt: Optional system prompt
            temperature: Temperature setting
            max_tokens: Max tokens setting
            model: Model name
            ttl: Time-to-live in seconds (uses default if None)
            
        Returns:
            True if cached successfully, False otherwise
        """
        if not self.enabled:
            return False
        
        try:
            cache_key = self._generate_cache_key(
                prompt, system_prompt, temperature, max_tokens, model
            )
            
            # Use provided TTL or default
            expiry = ttl or self.default_ttl
            
            # Store in Redis with expiration
            await self.redis.setex(
                cache_key,
                expiry,
                response
            )
            
            logger.info(f"Cache SET for key: {cache_key[:20]}... (TTL={expiry}s)")
            return True
            
        except Exception as e:
            logger.error(f"Cache SET error: {str(e)}")
            # Graceful degradation - don't fail if cache fails
            return False
    
    async def delete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        model: Optional[str] = None
    ) -> bool:
        """
        Delete a specific cached response.
        
        Args:
            prompt: The user prompt
            system_prompt: Optional system prompt
            temperature: Temperature setting
            max_tokens: Max tokens setting
            model: Model name
            
        Returns:
            True if deleted successfully, False otherwise
        """
        if not self.enabled:
            return False
        
        try:
            cache_key = self._generate_cache_key(
                prompt, system_prompt, temperature, max_tokens, model
            )
            
            result = await self.redis.delete(cache_key)
            
            if result:
                logger.info(f"Cache DELETE for key: {cache_key[:20]}...")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Cache DELETE error: {str(e)}")
            return False
    
    async def clear_all(self) -> bool:
        """
        Clear all LLM cache entries.
        
        WARNING: This deletes all keys matching "llm:cache:*"
        
        Returns:
            True if cleared successfully, False otherwise
        """
        if not self.enabled:
            return False
        
        try:
            # Find all cache keys
            keys = []
            async for key in self.redis.scan_iter(match="llm:cache:*"):
                keys.append(key)
            
            if keys:
                # Delete all found keys
                await self.redis.delete(*keys)
                logger.info(f"Cache CLEAR: deleted {len(keys)} keys")
                return True
            
            logger.info("Cache CLEAR: no keys to delete")
            return True
            
        except Exception as e:
            logger.error(f"Cache CLEAR error: {str(e)}")
            return False
    
    async def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache stats (key count, memory usage, etc.)
        """
        if not self.enabled:
            return {
                "enabled": False,
                "message": "Cache is disabled (no Redis connection)"
            }
        
        try:
            # Count cache keys
            key_count = 0
            async for _ in self.redis.scan_iter(match="llm:cache:*"):
                key_count += 1
            
            # Get Redis info
            info = await self.redis.info()
            
            return {
                "enabled": True,
                "key_count": key_count,
                "memory_used_bytes": info.get("used_memory", 0),
                "memory_used_human": info.get("used_memory_human", "N/A"),
                "total_keys": info.get("db0", {}).get("keys", 0) if "db0" in info else 0,
                "default_ttl_seconds": self.default_ttl
            }
            
        except Exception as e:
            logger.error(f"Cache STATS error: {str(e)}")
            return {
                "enabled": True,
                "error": str(e)
            }


# Singleton instance (will be initialized with Redis client if available)
llm_cache: Optional[LLMCache] = None


def initialize_cache(redis_client=None, default_ttl: int = 3600) -> LLMCache:
    """
    Initialize the global cache instance.
    
    Call this during app startup with a Redis client.
    
    Args:
        redis_client: Redis client instance (or None to disable caching)
        default_ttl: Default TTL in seconds
        
    Returns:
        Initialized LLMCache instance
    """
    global llm_cache
    llm_cache = LLMCache(redis_client=redis_client, default_ttl=default_ttl)
    return llm_cache


def get_cache() -> LLMCache:
    """
    Get the global cache instance.
    
    Returns:
        LLMCache instance (creates disabled cache if not initialized)
    """
    global llm_cache
    if llm_cache is None:
        # Create disabled cache as fallback
        llm_cache = LLMCache(redis_client=None)
    return llm_cache
