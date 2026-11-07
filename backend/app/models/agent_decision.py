from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Float
from app.core.database import Base


class AgentDecision(Base):
    """Historical recommendations, execution plans, and rationale from LangGraph."""
    __tablename__ = "agent_decisions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True, nullable=False)
    user_query = Column(Text, nullable=False)
    recommendation_title = Column(String(200), nullable=False)
    executive_summary = Column(Text, nullable=False)
    action_type = Column(String(50), nullable=False)      # 'HEDGE_CRUSH', 'LOCK_BASIS', 'HOLD', 'SQUEEZE_ALERT'
    risk_rating = Column(String(20), default="MODERATE")  # 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
    confidence_score = Column(Float, default=0.88)
    actions = Column(JSON, nullable=False)                # Exact contract sizing and execution steps
    model_used = Column(String(50), default="claude-3-5-sonnet")
    created_at = Column(DateTime, default=datetime.utcnow)

