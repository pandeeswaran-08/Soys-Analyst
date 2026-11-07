from typing import TypedDict, List, Dict, Any, Optional


class AgentState(TypedDict, total=False):
    """
    LangGraph State for SoyDecision Desk Quantitative Procurement & Hedging Agent.
    Strictly coordinates IntentClassifier -> Planner -> ToolRouter -> NumericalSafetyGuard -> Synthesizer.
    """
    # Request & Session Context
    query: str
    session_id: str
    model: Optional[str]
    context: Dict[str, Any]

    # Node 1: IntentClassifier
    intent: str  # 'LANDED_COST_PARITY', 'PRICE_FORECAST', 'INVENTORY_SAFETY_STOCK', 'TIMING_SIGNAL', 'SCENARIO_STRESS_TEST', 'DOCUMENT_RAG', 'COMPREHENSIVE_STRATEGY'
    intent_confidence: float
    extracted_params: Dict[str, Any]

    # Node 2: Planner
    plan: str  # Human-visible formatted markdown plan
    plan_steps: List[str]

    # Node 3: ToolRouter / Executor
    tool_calls: List[Dict[str, Any]]
    tool_results: Dict[str, Any]
    tool_traces: List[Dict[str, Any]]
    ground_truth_numbers: Dict[str, float]  # Every numeric value calculated by math_core
    retrieved_intel: List[Dict[str, Any]]   # Qdrant hybrid search citations

    # Node 4: NumericalSafetyGuard (CRITICAL)
    safety_guard_report: Dict[str, Any]  # status ('PASSED'/'RECALCULATED'/'REJECTED'), verified_numbers, rejected_claims
    safety_verified: bool
    recalculation_count: int
    unverified_claims: List[str]

    # Node 5: Synthesizer
    draft_response: str
    final_response: str
    citations: List[Dict[str, Any]]
    recommendation_title: str
    executive_summary: str
    action_type: str
    risk_rating: str
    confidence_score: float

    # Execution trace log
    trace: List[str]
    error: Optional[str]

    # Backwards compatibility fields
    bean_price: float
    meal_price: float
    oil_price: float
    basis_soybean: float
    crush_metrics: Dict[str, Any]
    basis_analysis: Dict[str, Any]
    risk_metrics: Dict[str, Any]
    cbot_orders: Dict[str, Any]
    route: str
