from fastapi import APIRouter
from app.core.redis_client import redis_service
from app.core.qdrant_client import qdrant_service

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SoyDecision Desk Backend",
        "redis_connected": redis_service.is_healthy,
        "qdrant_connected": qdrant_service.is_healthy,
        "version": "0.1.0",
    }

