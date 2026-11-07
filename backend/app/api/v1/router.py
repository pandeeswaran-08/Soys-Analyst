from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.market_data import router as market_router
from app.api.v1.crush import router as crush_router
from app.api.v1.basis import router as basis_router
from app.api.v1.risk import router as risk_router
from app.api.v1.forecast import router as forecast_router
from app.api.v1.agent import router as agent_router
from app.api.v1.math_endpoints import router as math_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["Health"])
api_router.include_router(math_router, tags=["Procurement & Math Core"])
api_router.include_router(market_router, prefix="/market", tags=["Market Data"])
api_router.include_router(crush_router, prefix="/crush", tags=["Crush Analytics"])
api_router.include_router(basis_router, prefix="/basis", tags=["Basis Pricing"])
api_router.include_router(risk_router, prefix="/risk", tags=["Risk & Hedging"])
api_router.include_router(forecast_router, prefix="/forecast", tags=["Econometric Forecasting"])
api_router.include_router(agent_router, prefix="/agent", tags=["Decision Agent"])
