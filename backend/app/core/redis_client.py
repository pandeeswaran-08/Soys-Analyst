import logging
import json
import hashlib
import time
from typing import Optional, Dict, Any, Callable

try:
    import redis.asyncio as aioredis
except ImportError:
    aioredis = None

from app.core.config import settings

logger = logging.getLogger("soydecision-redis")


class RedisService:
    def __init__(self):
        self.client: Any = None
        self._connected = False
        # Local in-memory cache fallback: key -> (value_json, expiry_timestamp)
        self._local_cache: Dict[str, tuple[str, float]] = {}

    async def connect(self):
        if aioredis is None:
            logger.info("Redis library not installed in current environment; using in-memory TTL caching engine.")
            self._connected = False
            return

        try:
            self.client = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=2.0,
            )
            await self.client.ping()
            self._connected = True
            logger.info("Connected to Redis successfully.")
        except Exception as e:
            logger.warning(f"Redis connection unavailable ({e}). Operating with in-memory TTL cache fallback.")
            self._connected = False

    async def disconnect(self):
        if self.client:
            await self.client.close()
            self._connected = False

    def _clean_expired_local(self):
        now = time.time()
        expired_keys = [k for k, (_, exp) in self._local_cache.items() if now > exp]
        for k in expired_keys:
            self._local_cache.pop(k, None)

    async def get(self, key: str) -> Optional[str]:
        if self._connected and self.client:
            try:
                return await self.client.get(key)
            except Exception as e:
                logger.warning(f"Redis get error ({e}), falling back to local memory.")
        
        # In-memory fallback
        self._clean_expired_local()
        item = self._local_cache.get(key)
        if item:
            val, exp = item
            if time.time() <= exp:
                return val
            else:
                self._local_cache.pop(key, None)
        return None

    async def set(self, key: str, value: str, expire: int = 300) -> bool:
        # Always update local cache as hot backup
        now = time.time()
        self._local_cache[key] = (value, now + expire)

        if self._connected and self.client:
            try:
                await self.client.set(key, value, ex=expire)
                return True
            except Exception as e:
                logger.warning(f"Redis set error ({e}).")
        return True

    @staticmethod
    def generate_cache_key(prefix: str, payload: Any) -> str:
        """Generates deterministic SHA-256 hash of JSON-serializable parameters."""
        if hasattr(payload, "model_dump"):
            raw_dict = payload.model_dump()
        elif isinstance(payload, dict):
            raw_dict = payload
        else:
            raw_dict = {"data": str(payload)}
        
        serialized = json.dumps(raw_dict, sort_keys=True, default=str)
        digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()[:16]
        return f"cache:{prefix}:{digest}"

    async def get_or_compute(
        self,
        prefix: str,
        params: Any,
        compute_fn: Callable[[], Any],
        expire: int = 600,
    ) -> Dict[str, Any]:
        """
        Retrieves cached result if present; otherwise runs compute_fn,
        caches the result in Redis, and returns it.
        """
        cache_key = self.generate_cache_key(prefix, params)
        cached_raw = await self.get(cache_key)

        if cached_raw:
            try:
                data = json.loads(cached_raw)
                logger.info(f"Cache HIT for key: {cache_key}")
                data["_cached"] = True
                data["_cache_key"] = cache_key
                return data
            except Exception:
                pass

        logger.info(f"Cache MISS for key: {cache_key}. Executing compute function...")
        result = compute_fn()
        if hasattr(result, "model_dump"):
            result_dict = result.model_dump()
        elif isinstance(result, dict):
            result_dict = result.copy()
        else:
            result_dict = {"result": result}

        # Store in cache
        try:
            await self.set(cache_key, json.dumps(result_dict, default=str), expire=expire)
        except Exception as e:
            logger.warning(f"Failed to cache result ({e})")

        result_dict["_cached"] = False
        result_dict["_cache_key"] = cache_key
        return result_dict

    @property
    def is_healthy(self) -> bool:
        return self._connected


redis_service = RedisService()
