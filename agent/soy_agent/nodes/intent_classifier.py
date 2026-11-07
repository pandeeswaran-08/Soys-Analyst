"""
Node 1: IntentClassifier
Classifies the user query into precise commodity procurement & risk categories.
Extracts operational parameters (prices, stock days, lead times, FX rates).
"""

import re
import logging
from typing import Dict, Any
from soy_agent.state import AgentState
from soy_agent.llm import get_reasoning_llm

logger = logging.getLogger("soydecision-intent")


def intent_classifier_node(state: AgentState) -> AgentState:
    """Classifies user query and extracts operational parameters."""
    query = state.get("query", "").strip()
    context = state.get("context", {}) or {}
    trace = state.get("trace", [])
    trace.append(f"[IntentClassifier] Parsing procurement query: \"{query}\"")

    query_lower = query.lower()

    # Rule-based intent detection with semantic keyword matching
    intent = "COMPREHENSIVE_STRATEGY"
    confidence = 0.85
    extracted: Dict[str, Any] = {}

    # Check for landed cost
    if any(k in query_lower for k in ["landed cost", "import parity", "cif", "fob", "customs duty", "mandi tax", "freight cost"]):
        intent = "LANDED_COST_PARITY"
        confidence = 0.95
    # Check for price forecasting
    elif any(k in query_lower for k in ["forecast", "future price", "holt winters", "price trend", "price projection", "predict price"]):
        intent = "PRICE_FORECAST"
        confidence = 0.94
    # Check for inventory / safety stock
    elif any(k in query_lower for k in ["safety stock", "reorder point", "rop", "eoq", "stockout", "lead time demand"]):
        intent = "INVENTORY_SAFETY_STOCK"
        confidence = 0.95
    # Check for timing signal
    elif any(k in query_lower for k in ["timing", "signal", "should we buy", "buy or wait", "procure now", "procurement timing"]):
        intent = "TIMING_SIGNAL"
        confidence = 0.96
    # Check for scenario / stress test
    elif any(k in query_lower for k in ["stress test", "scenario", "fx shock", "inr depreciation", "tariff hike", "weather shock"]):
        intent = "SCENARIO_STRESS_TEST"
        confidence = 0.95
    # Check for document intelligence / RAG
    elif any(k in query_lower for k in ["wasde", "conab", "usda", "barge", "tariff rate", "report", "crop progress", "biofuel mandate"]):
        intent = "DOCUMENT_RAG"
        confidence = 0.92

    # Extract numerical parameters from query / context
    # Regex extract numbers
    # Look for INR prices (e.g. 4800, 4900, 5200)
    inr_matches = re.findall(r"(?:₹|inr|rs\.?)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)", query_lower)
    if inr_matches:
        extracted["domestic_price"] = float(inr_matches[0].replace(",", ""))

    # Look for USD numbers (e.g. $960, 960 usd)
    usd_matches = re.findall(r"(?:\$|usd)\s*([0-9]+(?:\.[0-9]+)?)", query_lower)
    if usd_matches:
        extracted["fob_price_usd"] = float(usd_matches[0])

    # Look for stock days / levels
    stock_matches = re.findall(r"([0-9]+)\s*(?:days|days of stock|days inventory|quintals|mt)", query_lower)
    if stock_matches:
        extracted["current_stock_days"] = float(stock_matches[0])

    # Incorporate provided context
    for k, v in context.items():
        extracted[k] = v

    state["intent"] = intent
    state["intent_confidence"] = confidence
    state["extracted_params"] = extracted
    state["recalculation_count"] = state.get("recalculation_count", 0)

    trace.append(f"[IntentClassifier] Intent resolved: {intent} (Confidence: {confidence:.2f}) | Extracted params: {list(extracted.keys())}")
    state["trace"] = trace
    return state

