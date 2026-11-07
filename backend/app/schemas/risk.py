from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class VaRRequest(BaseModel):
    portfolio_value: float = Field(default=5_000_000.0, description="Total book value in USD")
    daily_volatility: float = Field(default=0.018, description="Estimated daily price volatility (e.g. 1.8%)")
    holding_period_days: int = Field(default=1, description="Holding horizon in days")
    confidence_level: float = Field(default=0.95, description="Confidence level (0.95 or 0.99)")


class MonteCarloRequest(BaseModel):
    bean_price: float = Field(default=10.25)
    meal_price: float = Field(default=312.0)
    oil_price_cents: float = Field(default=44.5)
    days: int = Field(default=30)
    simulations: int = Field(default=500)


class HedgeOptimizeRequest(BaseModel):
    bushels: float = Field(default=100_000.0, description="Crush commitment in bushels")
    hedge_ratio: float = Field(default=0.85, description="Target hedge coverage ratio")
    spot_changes: Optional[List[float]] = None
    futures_changes: Optional[List[float]] = None

