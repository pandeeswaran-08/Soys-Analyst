from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AgentRunRequest(BaseModel):
    query: str = Field(
        default="Crush margins are projected at $1.52/bu for Q3 with soybean basis firming in Illinois. Should we lock 75% of the crush margin now or defer hedging?",
        description="Trader inquiry or decision request"
    )
    session_id: Optional[str] = "demo-session-1"
    model_provider: Optional[str] = "claude-3-5-sonnet"  # or gpt-4o


class ActionPlanStep(BaseModel):
    step: int
    instrument: str
    action: str
    quantity: str
    target_price: str
    rationale: str


class AgentRunResponse(BaseModel):
    session_id: str
    query: str
    recommendation_title: str
    executive_summary: str
    action_type: str
    risk_rating: str
    confidence_score: float
    recommended_hedge_ratio: float
    calculated_margin_dollars_bu: float
    cbot_orders: Dict[str, Any]
    action_steps: List[ActionPlanStep]
    intelligence_sources: List[Dict[str, Any]]
    execution_trace: List[str]
    model_used: str

