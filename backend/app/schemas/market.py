from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class QuoteItem(BaseModel):
    symbol: str
    name: str
    contract_month: str
    price: float
    change: float
    change_pct: float
    volume: int
    open_interest: int
    unit: str
    updated_at: Optional[datetime] = None


class BasisItem(BaseModel):
    location_name: str
    location_type: str
    commodity: str = "Soybeans"
    basis_cents: float
    delivery_period: str
    freight_rate_cents: float = 0.0


class MarketOverviewResponse(BaseModel):
    as_of: datetime
    soybeans: List[QuoteItem]
    meal: List[QuoteItem]
    oil: List[QuoteItem]
    basis_bids: List[BasisItem]
    board_crush_cents: float
    board_crush_dollars: float
    oil_share_pct: float

