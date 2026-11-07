"""
Unit and Integration Tests for the 5-Node SoyDecision Desk LangGraph Agent:
1. IntentClassifier
2. Planner (creates short visible plan)
3. ToolRouter / Executor (calls math tools + document retriever)
4. NumericalSafetyGuard (CRITICAL - guarantees 100% numerical grounding, rejects ungrounded claims)
5. Synthesizer (produces final answer with citations + tool traces)
"""

import sys
import pytest
from pathlib import Path

# Add backend and agent directories to sys.path
root_dir = Path(__file__).resolve().parents[2]
if str(root_dir / "backend") not in sys.path:
    sys.path.insert(0, str(root_dir / "backend"))
if str(root_dir / "agent") not in sys.path:
    sys.path.insert(0, str(root_dir / "agent"))

from soy_agent.graph import soy_agent_app, stream_soy_agent_execution
from soy_agent.nodes.intent_classifier import intent_classifier_node
from soy_agent.nodes.planner import planner_node
from soy_agent.nodes.tool_router import tool_router_node
from soy_agent.nodes.numerical_safety_guard import (
    numerical_safety_guard_node,
    verify_numeric_grounding,
)
from soy_agent.nodes.synthesizer import synthesizer_node


class TestFiveNodeLangGraphAgent:
    def test_node_1_intent_classifier(self):
        """Verifies IntentClassifier detects intent and extracts parameters."""
        state = {
            "query": "Indore mandi price is ₹4,900/qtl and Brazilian CIF is $960/MT. What is our landed cost parity?",
            "context": {"current_stock": 350.0},
            "trace": [],
        }
        out = intent_classifier_node(state)
        assert out["intent"] == "LANDED_COST_PARITY"
        assert out["intent_confidence"] >= 0.90
        assert out["extracted_params"]["domestic_price"] == 4900.0
        assert out["extracted_params"]["fob_price_usd"] == 960.0
        assert len(out["trace"]) >= 2

    def test_node_2_planner(self):
        """Verifies Planner produces a visible, short, numbered execution plan."""
        state = {
            "intent": "LANDED_COST_PARITY",
            "extracted_params": {"domestic_price": 4900.0},
            "trace": [],
        }
        out = planner_node(state)
        assert "plan" in out
        assert len(out["plan_steps"]) >= 4
        # Visible plan must mention tools and NumericalSafetyGuard
        assert "calculate_domestic_landed_cost_tool" in out["plan"]
        assert "NumericalSafetyGuard" in out["plan"]
        assert "Document Retrieval (RAG)" in out["plan"]

    def test_node_3_tool_router_executor(self):
        """Verifies ToolRouter executes math tools and Qdrant hybrid retrieval."""
        state = {
            "intent": "LANDED_COST_PARITY",
            "query": "Compare Indore domestic and Brazilian CIF import landed cost.",
            "extracted_params": {"domestic_price": 4900.0, "fob_price_usd": 960.0},
            "trace": [],
            "tool_traces": [],
            "tool_results": {},
            "ground_truth_numbers": {},
        }
        out = tool_router_node(state)
        assert "retrieved_intel" in out
        assert len(out["retrieved_intel"]) >= 1
        # Check math core tools executed
        assert "domestic_landed_cost" in out["tool_results"]
        assert "international_landed_cost" in out["tool_results"]
        assert out["ground_truth_numbers"]["domestic_base_price"] == 4900.0
        assert out["ground_truth_numbers"]["domestic_total_landed_cost"] > 5000.0
        assert out["ground_truth_numbers"]["international_landed_cost_per_quintal"] > 8000.0

    def test_node_4_numerical_safety_guard_clean_pass(self):
        """Verifies NumericalSafetyGuard certifies valid math_core numbers."""
        state = {
            "ground_truth_numbers": {
                "domestic_total_landed_cost": 5238.64,
                "international_landed_cost": 10043.78,
                "reorder_point": 393.52,
                "safety_stock": 43.52,
            },
            "tool_results": {},
            "recalculation_count": 0,
            "draft_response": "Domestic landed cost is INR 5238.64/qtl, below ROP 393.52.",
            "trace": [],
        }
        out = numerical_safety_guard_node(state)
        assert out["safety_verified"] is True
        assert out["safety_guard_report"]["status"] == "PASSED"
        assert len(out["safety_guard_report"]["rejected_claims"]) == 0

    def test_node_4_numerical_safety_guard_rejects_ungrounded_number(self):
        """
        CRITICAL TEST:
        Verifies that an ungrounded number (e.g. hallucinated by an LLM) is strictly
        flagged as a violation and forces recalculation or rejection.
        """
        authorized_pool = {5000.0, 5238.64, 10043.78, 393.52}
        hallucinated_text = "The projected soybean price will hit INR 7,899.50 with a 42.8% surge."

        is_valid, verified, rejected = verify_numeric_grounding(hallucinated_text, authorized_pool)
        assert is_valid is False
        assert any("7899.5" in r or "7,899.50" in r for r in rejected)
        assert any("42.8" in r for r in rejected)

        state = {
            "ground_truth_numbers": {"domestic_cost": 5238.64},
            "tool_results": {},
            "recalculation_count": 0,
            "draft_response": hallucinated_text,
            "trace": [],
        }
        out = numerical_safety_guard_node(state)
        # Must flag violation and trigger recalculation pass
        assert out["safety_verified"] is False
        assert out["safety_guard_report"]["status"] == "RECALCULATED"
        assert len(out["safety_guard_report"]["rejected_claims"]) >= 1

    def test_node_5_synthesizer(self):
        """Verifies Synthesizer outputs final markdown with citations and tool traces."""
        state = {
            "intent": "LANDED_COST_PARITY",
            "plan": "1. Retrieve docs\n2. Math tools\n3. Safety Guard",
            "ground_truth_numbers": {
                "domestic_base_price": 4900.0,
                "domestic_total_landed_cost": 5238.64,
                "international_landed_cost_per_quintal": 10043.78,
                "international_fob_usd": 960.0,
                "exchange_rate": 85.50,
                "forecast_mean_t1": 5130.0,
                "forecast_mean_t7": 5210.0,
            },
            "tool_results": {
                "timing_signal": {
                    "signal": "BUY_AGGRESSIVE",
                    "action": "PROCURE_FULL_ALLOCATION",
                    "urgency_level": "HIGH",
                    "recommended_order_fraction": 1.0,
                },
                "inventory_evaluation": {
                    "status": "REORDER_NOW",
                    "current_stock": 360.0,
                    "reorder_point": 393.52,
                    "safety_stock": 43.52,
                    "estimated_days_of_supply": 7.2,
                },
            },
            "retrieved_intel": [
                {"title": "USDA WASDE", "source": "USDA", "hybrid_score": 0.92, "content": "Soybean stocks steady."}
            ],
            "tool_traces": [
                {"tool": "calculate_domestic_landed_cost_tool", "output": "INR 5238.64"}
            ],
            "safety_guard_report": {"status": "PASSED", "certified_pool_size": 25},
            "trace": [],
        }
        out = synthesizer_node(state)
        assert "final_response" in out
        assert "Executive Procurement Recommendation" in out["final_response"]
        assert "Audited Numerical Evidence Matrix" in out["final_response"]
        assert "Market Intelligence & Document Citations" in out["final_response"]
        assert "NumericalSafetyGuard Audit Report" in out["final_response"]
        assert len(out["citations"]) >= 1

    def test_full_graph_invocation(self):
        """End-to-end integration test through the compiled 5-node LangGraph StateGraph."""
        initial_state = {
            "query": "Indore mandi price is ₹4,900/qtl and Brazilian CIF is $960/MT. What is our landed cost parity and should we procure?",
            "session_id": "test-graph-session",
            "context": {"current_stock": 360.0, "domestic_price": 4900.0, "fob_price_usd": 960.0},
            "trace": [],
            "recalculation_count": 0,
            "tool_traces": [],
            "tool_results": {},
            "ground_truth_numbers": {},
        }
        result = soy_agent_app.invoke(initial_state)
        assert result["intent"] == "LANDED_COST_PARITY"
        assert "plan" in result
        assert "domestic_landed_cost" in result["tool_results"]
        assert result["safety_verified"] is True
        assert result["safety_guard_report"]["status"] == "PASSED"
        assert "final_response" in result
        assert "5238.64" in result["final_response"]

    @pytest.mark.asyncio
    async def test_streaming_agent_execution(self):
        """Verifies streaming generator yields live events for all 5 nodes and tool traces."""
        events = []
        async for ev in stream_soy_agent_execution("Indore spot is 4900. What is the landed cost?"):
            events.append(ev)

        ev_types = [e.get("event") for e in events]
        assert "node_start" in ev_types
        assert "intent_classified" in ev_types
        assert "plan_created" in ev_types
        assert "tool_executed" in ev_types
        assert "safety_guard_audit" in ev_types
        assert "token" in ev_types
        assert "complete" in ev_types

