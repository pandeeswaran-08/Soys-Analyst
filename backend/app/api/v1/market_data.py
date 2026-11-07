from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter
from app.schemas.market import MarketOverviewResponse
from app.services.seed_service import SeedService
from app.math.crush_margin import calculate_board_crush, calculate_oil_share

router = APIRouter()

@router.get("/overview", response_model=MarketOverviewResponse)
async def get_market_overview():
    quotes = SeedService.get_sample_market_quotes()
    basis_bids = SeedService.get_sample_basis_bids()

    # Front contract values
    front_bean = quotes["soybeans"][0]["price"]       # cents/bu
    front_meal = quotes["meal"][0]["price"]           # $/ton
    front_oil = quotes["oil"][0]["price"]             # cents/lb

    board_crush_cents = calculate_board_crush(
        soybean_price_cents_per_bu=front_bean,
        meal_price_dollars_per_ton=front_meal,
        oil_price_cents_per_lb=front_oil,
    )
    oil_share = calculate_oil_share(
        meal_price_dollars_per_ton=front_meal,
        oil_price_cents_per_lb=front_oil,
    )

    return {
        "as_of": datetime.utcnow(),
        "soybeans": quotes["soybeans"],
        "meal": quotes["meal"],
        "oil": quotes["oil"],
        "basis_bids": basis_bids,
        "board_crush_cents": round(board_crush_cents, 2),
        "board_crush_dollars": round(board_crush_cents / 100.0, 4),
        "oil_share_pct": round(oil_share, 2),
    }

@router.get("/history")
async def get_market_history(days: int = 90):
    return SeedService.generate_historical_series(days=days)

