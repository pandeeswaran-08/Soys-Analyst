"""
Node 2: Planner
Generates a concise, visible, numbered execution plan for the query.
Outlines required math_core tools, document retrieval, and safety verification.
"""

import logging
from typing import List
from soy_agent.state import AgentState
from soy_agent.llm import get_reasoning_llm

logger = logging.getLogger("soydecision-planner")


def planner_node(state: AgentState) -> AgentState:
    """Builds a structured, human-readable execution plan based on classified intent."""
    intent = state.get("intent", "COMPREHENSIVE_STRATEGY")
    extracted = state.get("extracted_params", {})
    trace = state.get("trace", [])
    trace.append(f"[Planner] Generating execution plan for intent: {intent}")

    steps: List[str] = []

    # Step 1: Always retrieve grounding market intelligence via Qdrant Hybrid Search
    steps.append("1. **Document Retrieval (RAG)**: Execute Qdrant hybrid search (dense semantic + sparse BM25) for grain market intelligence & policy updates.")

    # Step 2: Math core tool executions based on intent
    if intent == "LANDED_COST_PARITY":
        steps.append("2. **Landed Cost Engine**: Execute `calculate_domestic_landed_cost_tool` (Indore Mandi) and `calculate_international_landed_cost_tool` (CIF Nhava Sheva).")
        steps.append("3. **Parity Arbitrage**: Compare net delivered costs per quintal and compute channel advantage.")
    elif intent == "PRICE_FORECAST":
        steps.append("2. **Time Series Forecasting**: Execute `forecast_price_tool` using statsmodels Holt-Winters with additive/multiplicative seasonality.")
        steps.append("3. **Uncertainty Bounds**: Compute 80% and 95% forecast confidence intervals across projection horizons.")
    elif intent == "INVENTORY_SAFETY_STOCK":
        steps.append("2. **Inventory Risk Modeling**: Execute `calculate_safety_stock_tool` and `calculate_reorder_point_tool` considering lead time volatility.")
        steps.append("3. **Position Diagnosis**: Run `evaluate_inventory_position_tool` to categorize stock into CRITICAL, REORDER_NOW, or HEALTHY.")
    elif intent == "TIMING_SIGNAL":
        steps.append("2. **Price & Inventory Synthesis**: Run `forecast_price_tool` and evaluate current stock vs reorder threshold.")
        steps.append("3. **Deterministic Timing**: Call `generate_timing_signal_tool` to determine BUY / WAIT / MONITOR action and urgency level.")
    elif intent == "SCENARIO_STRESS_TEST":
        steps.append("2. **Macro Stress Testing**: Call `stress_test_procurement_tool` across USD/INR exchange rates, ocean freight shocks, and weather events.")
        steps.append("3. **Worst-Case Parity Analysis**: Evaluate landed cost deviation under combined disaster conditions.")
    else:  # COMPREHENSIVE_STRATEGY
        steps.append("2. **Comprehensive Math Evaluation**: Execute landed cost parity, Holt-Winters 7-day forecast, inventory ROP, and timing signal tools.")
        steps.append("3. **Multi-Factor Trade-off**: Align market fundamentals with physical plant crush economics and stock positions.")

    # Step 4: Numerical Safety Guard (CRITICAL)
    steps.append("4. **NumericalSafetyGuard (CRITICAL)**: Audit all numeric figures against math_core tool outputs. Reject any ungrounded figures and enforce recalculation.")

    # Step 5: Strategic Synthesis
    steps.append("5. **Executive Decision Synthesis**: Synthesize final strategic recommendation with citations, risk ratings, and live tool traces.")

    plan_markdown = "\n".join(steps)
    state["plan"] = plan_markdown
    state["plan_steps"] = steps

    trace.append(f"[Planner] Visible Plan formulated ({len(steps)} steps):\n" + plan_markdown)
    state["trace"] = trace
    return state

