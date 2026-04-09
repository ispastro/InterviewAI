from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings, validate_configuration
from app.database import startup_database, shutdown_database, check_database_connection
from app.core.error_handlers import register_exception_handlers
from app.modules.auth.router import router as auth_router
from app.modules.interviews.router import router as interviews_router
from app.modules.websocket.routes import router as websocket_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting InterviewMe API...")
    try:
        validate_configuration()
        await startup_database()
        
        # Initialize Upstash Redis
        if settings.REDIS_ENABLED:
            try:
                from app.integrations.upstash import get_redis
                redis = get_redis()
                
                if await redis.ping():
                    print(f"✅ Upstash Redis connected (TTL={settings.CACHE_TTL_SECONDS}s)")
                else:
                    print("⚠️ Redis ping failed - caching disabled")
            except Exception as e:
                print(f"⚠️ Redis initialization failed: {e}")
                print("⚠️ App will work without caching")
        else:
            print("ℹ️ Redis caching disabled (REDIS_ENABLED=false)")
        
        print(f"InterviewMe API started — env: {settings.ENVIRONMENT}")
    except Exception as e:
        print(f"Failed to start: {e}")
        raise
    yield
    print("Shutting down...")
    await shutdown_database()


app = FastAPI(
    title="InterviewMe API",
    description="AI-powered mock interview platform",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

register_exception_handlers(app)

app.include_router(auth_router)
app.include_router(interviews_router)
app.include_router(websocket_router)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "interviewme-api",
        "version": "0.1.0",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/health/ready")
async def readiness_check():
    checks = {
        "database": await check_database_connection(),
        "configuration": True,
    }
    
    # Check Redis if enabled
    if settings.REDIS_ENABLED:
        try:
            from app.integrations.upstash import get_redis
            redis = get_redis()
            checks["redis"] = await redis.ping()
        except:
            checks["redis"] = False
    
    return {
        "status": "ready" if all(checks.values()) else "not_ready",
        "checks": checks,
        "service": "interviewme-api",
        "version": "0.1.0",
    }


@app.get("/")
async def root():
    return {
        "message": "Welcome to InterviewMe API",
        "version": "0.1.0",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if not settings.is_production else "Not available in production",
        "health": "/health",
    }


@app.get("/health/redis")
async def redis_health():
    """Redis cache health and metrics."""
    try:
        from app.integrations.upstash import get_redis
        redis = get_redis()
        
        if not redis.enabled:
            return {
                "status": "disabled",
                "message": "Redis caching is disabled"
            }
        
        ping_ok = await redis.ping()
        metrics = await redis.get_metrics()
        
        return {
            "status": "healthy" if ping_ok else "unhealthy",
            "ping": ping_ok,
            "metrics": metrics
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


if settings.is_development:
    @app.get("/dev/test-auth")
    async def create_test_token():
        from app.modules.auth.dependencies import create_test_token
        token = create_test_token(email="test@example.com", name="Test User")
        return {"token": token, "usage": "Add 'Authorization: Bearer <token>' header", "expires_in": "1 hour"}
