from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Index
from app.core.database import Base


class MarketQuote(Base):
    """Real-time and settlement commodity futures and cash prices."""
    __tablename__ = "market_quotes"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)  # e.g., ZS (Beans), ZM (Meal), ZL (Oil)
    name = Column(String(100), nullable=False)
    contract_month = Column(String(10), nullable=False)     # e.g., 'F25', 'H25', 'K25', 'N25', 'X25'
    price = Column(Float, nullable=False)                   # Cents/bu, $/ton, or cents/lb
    change = Column(Float, default=0.0)
    change_pct = Column(Float, default=0.0)
    volume = Column(Integer, default=0)
    open_interest = Column(Integer, default=0)
    unit = Column(String(20), nullable=False)               # 'cents/bu', '$/ton', 'cents/lb'
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("ix_market_quotes_symbol_month", "symbol", "contract_month"),
    )


class BasisQuote(Base):
    """Regional cash basis bids and offers."""
    __tablename__ = "basis_quotes"

    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String(100), nullable=False)    # e.g., 'Central Illinois River', 'CIF NOLA Gulf'
    location_type = Column(String(50), nullable=False)     # 'Interior Elevator', 'River Terminal', 'Export Port'
    commodity = Column(String(50), default="Soybeans")
    basis_cents = Column(Float, nullable=False)            # e.g., -15.0 (15 under), +65.0 (65 over)
    delivery_period = Column(String(50), nullable=False)   # 'Spot', 'FH Nov', 'LH Nov'
    freight_rate_cents = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow)

