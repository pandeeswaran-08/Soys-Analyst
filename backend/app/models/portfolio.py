from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from app.core.database import Base


class CrushPosition(Base):
    """Crushing plant physical commitments & financial hedge book."""
    __tablename__ = "crush_positions"

    id = Column(Integer, primary_key=True, index=True)
    plant_location = Column(String(100), default="Decatur, IL")
    bushels_committed = Column(Float, nullable=False)
    entry_bean_price_bu = Column(Float, nullable=False)
    entry_meal_price_ton = Column(Float, nullable=False)
    entry_oil_price_lb_cents = Column(Float, nullable=False)
    locked_crush_margin_bu = Column(Float, nullable=False)
    hedged_ratio = Column(Float, default=0.0)             # 0.0 to 1.0
    status = Column(String(20), default="ACTIVE")         # 'ACTIVE', 'SETTLED', 'CLOSED'
    created_at = Column(DateTime, default=datetime.utcnow)
    target_delivery_month = Column(String(20), nullable=False)

