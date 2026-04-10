

import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum

from app.integrations.upstash import get_redis, JobStatus

logger = logging.getLogger(__name__)


class JobTracker:
    
    
    def __init__(self):
        self.redis = get_redis()
        self.namespace = "job"
        self.default_ttl = 86400  # 24 hours
    
    def _job_key(self, job_id: str) -> str:
        
        return f"{self.namespace}:{job_id}"
    
    async def create_job(
        self,
        job_type: str,
        payload: Dict[str, Any],
        job_id: Optional[str] = None,
        ttl: Optional[int] = None
    ) -> str:
        
        if not self.redis.enabled:
            return job_id or f"job_{int(datetime.utcnow().timestamp())}"
        
        # Generate job ID if not provided
        if not job_id:
            import uuid
            job_id = str(uuid.uuid4())
        
        job_data = {
            "job_id": job_id,
            "job_type": job_type,
            "status": JobStatus.PENDING.value,
            "payload": json.dumps(payload),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "attempts": 0,
            "result": None,
            "error": None
        }
        
        # Store in Redis
        key = self._job_key(job_id)
        await self.redis.hset(key, job_data)
        await self.redis.expire(key, ttl or self.default_ttl)
        
        logger.info(f"📝 Job created: {job_id} ({job_type})")
        return job_id
    
    async def update_status(
        self,
        job_id: str,
        status: JobStatus,
        error: Optional[str] = None
    ) -> bool:
        
        if not self.redis.enabled:
            return False
        
        key = self._job_key(job_id)
        
        updates = {
            "status": status.value,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        if error:
            updates["error"] = error
        
        if status == JobStatus.PROCESSING:
            # Increment attempts
            current_attempts = await self.redis.hget(key, "attempts")
            updates["attempts"] = str(int(current_attempts or 0) + 1)
        
        await self.redis.hset(key, updates)
        
        logger.info(f"📊 Job status updated: {job_id} → {status.value}")
        return True
    
    async def complete_job(
        self,
        job_id: str,
        result: Dict[str, Any]
    ) -> bool:
        
        if not self.redis.enabled:
            return False
        
        key = self._job_key(job_id)
        
        # Get start time to calculate duration
        job_data = await self.redis.hgetall(key)
        created_at = job_data.get("created_at")
        
        duration = None
        if created_at:
            start = datetime.fromisoformat(created_at)
            duration = (datetime.utcnow() - start).total_seconds()
        
        updates = {
            "status": JobStatus.COMPLETED.value,
            "result": json.dumps(result),
            "completed_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        if duration:
            updates["duration_seconds"] = str(duration)
        
        await self.redis.hset(key, updates)
        
        logger.info(f"✅ Job completed: {job_id} (duration: {duration:.2f}s)")
        return True
    
    async def fail_job(
        self,
        job_id: str,
        error: str,
        is_dead_letter: bool = False
    ) -> bool:
        
        if not self.redis.enabled:
            return False
        
        key = self._job_key(job_id)
        
        status = JobStatus.DEAD_LETTER if is_dead_letter else JobStatus.FAILED
        
        updates = {
            "status": status.value,
            "error": error,
            "failed_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        await self.redis.hset(key, updates)
        
        logger.error(f"❌ Job failed: {job_id} - {error}")
        return True
    
    async def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        
        if not self.redis.enabled:
            return None
        
        key = self._job_key(job_id)
        job_data = await self.redis.hgetall(key)
        
        if not job_data:
            return None
        
        # Parse JSON fields
        if "payload" in job_data:
            try:
                job_data["payload"] = json.loads(job_data["payload"])
            except json.JSONDecodeError:
                pass
        
        if "result" in job_data and job_data["result"]:
            try:
                job_data["result"] = json.loads(job_data["result"])
            except json.JSONDecodeError:
                pass
        
        return job_data
    
    async def get_status(self, job_id: str) -> Optional[JobStatus]:
        
        if not self.redis.enabled:
            return None
        
        key = self._job_key(job_id)
        status_str = await self.redis.hget(key, "status")
        
        if not status_str:
            return None
        
        try:
            return JobStatus(status_str)
        except ValueError:
            return None
    
    async def get_result(self, job_id: str) -> Optional[Dict[str, Any]]:
        
        if not self.redis.enabled:
            return None
        
        key = self._job_key(job_id)
        result_str = await self.redis.hget(key, "result")
        
        if not result_str:
            return None
        
        try:
            return json.loads(result_str)
        except json.JSONDecodeError:
            return None
    
    async def delete_job(self, job_id: str) -> bool:
        
        if not self.redis.enabled:
            return False
        
        key = self._job_key(job_id)
        result = await self.redis.delete(key)
        
        if result > 0:
            logger.info(f"🗑️  Job deleted: {job_id}")
            return True
        
        return False
    
    async def list_jobs(
        self,
        job_type: Optional[str] = None,
        status: Optional[JobStatus] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        
        if not self.redis.enabled:
            return []
        
        # Get all job keys
        keys = await self.redis.keys(f"{self.namespace}:*")
        
        jobs = []
        for key in keys[:limit]:
            job_data = await self.redis.hgetall(key)
            if job_data:
                # Apply filters
                if job_type and job_data.get("job_type") != job_type:
                    continue
                if status and job_data.get("status") != status.value:
                    continue
                
                # Parse JSON fields
                if "payload" in job_data:
                    try:
                        job_data["payload"] = json.loads(job_data["payload"])
                    except json.JSONDecodeError:
                        pass
                
                if "result" in job_data and job_data["result"]:
                    try:
                        job_data["result"] = json.loads(job_data["result"])
                    except json.JSONDecodeError:
                        pass
                
                jobs.append(job_data)
        
        return jobs
    
    async def get_stats(self) -> Dict[str, Any]:
        
        if not self.redis.enabled:
            return {"enabled": False}
        
        jobs = await self.list_jobs(limit=1000)
        
        stats = {
            "total": len(jobs),
            "pending": 0,
            "processing": 0,
            "completed": 0,
            "failed": 0,
            "dead_letter": 0
        }
        
        for job in jobs:
            status = job.get("status", "")
            if status in stats:
                stats[status] += 1
        
        return stats


# Singleton instance
_job_tracker: Optional[JobTracker] = None


def get_job_tracker() -> JobTracker:
    
    global _job_tracker
    if _job_tracker is None:
        _job_tracker = JobTracker()
    return _job_tracker
