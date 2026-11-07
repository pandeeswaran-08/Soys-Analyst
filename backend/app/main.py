from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.core.redis_client import redis_service
from app.core.qdrant_client import qdrant_service
from app.api.v1.router import api_router
from app.api.v1.math_endpoints import router as math_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("soydecision-backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    logger.info("Initializing SoyDecision Desk Backend...")
    await init_db()
    await redis_service.connect()
    qdrant_service.connect()
    logger.info("SoyDecision Desk Backend initialization complete.")
    yield
    # Shutdown sequence
    await redis_service.disconnect()
    logger.info("SoyDecision Desk Backend shut down gracefully.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Algorithmic Decision Support and Math Engine for Soybean Crushers and Commodity Desks",
    version="0.1.0",
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount endpoints at root level (/calculate/landed-cost, /forecast/price, /chat, etc.)
app.include_router(math_router, tags=["Procurement & Math Core (Root)"])

# Mount all API endpoints under /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "desk": "SoyDecision Desk",
        "system": "FastAPI Pure Python Math Core",
        "status": "online",
        "endpoints": [
            "/calculate/landed-cost",
            "/forecast/price",
            "/inventory/safety-stock",
            "/timing-signal",
            "/scenario/stress-test",
            "/documents/upload",
            "/chat (streaming SSE)",
        ],
        "docs": f"{settings.API_V1_STR}/docs",
        "version": "0.1.0",
    }
