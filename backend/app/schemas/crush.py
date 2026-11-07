from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class CrushCalculateRequest(BaseModel):
    soybean_price_bu: float = Field(default=10.25, description="Soybean price in $/bushel (e.g., 10.25)")
    meal_price_ton: float = Field(default=312.0, description="Soybean meal in $/short ton (e.g., 312.0)")
    oil_price_lb_cents: float = Field(default=44.5, description="Soybean oil in cents/lb (e.g., 44.5)")
    operating_crush_cost_bu: float = Field(default=0.75, description="Crushing plant operational expense per bu")
    basis_soybean_bu: float = Field(default=-0.15, description="Local bean basis in $/bu")
    basis_meal_ton: float = Field(default=12.0, description="Local meal basis in $/ton")
    basis_oil_cents_lb: float = Field(default=0.5, description="Local oil basis in cents/lb")
    meal_yield_lbs: float = Field(default=44.0, description="Lbs of meal per 60 lb bushel")
    oil_yield_lbs: float = Field(default=11.0, description="Lbs of oil per 60 lb bushel")


class CrushCalculateResponse(BaseModel):
    board_crush_cents_per_bu: float
    board_crush_dollars_per_bu: float
    cash_gpm_dollars_per_bu: float
    net_processing_margin_dollars_per_bu: float
    oil_share_percent: float
    meal_share_percent: float
    product_value_dollars_per_bu: float
    meal_revenue_dollars_per_bu: float
    oil_revenue_dollars_per_bu: float
    raw_bean_cost_dollars_per_bu: float
    operating_cost_dollars_per_bu: float
    sensitivities: Dict[str, float]

