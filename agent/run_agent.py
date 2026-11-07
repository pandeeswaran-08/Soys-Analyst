"""
SoyDecision Desk - LangGraph Agent CLI Runner
Runs the 5-node quantitative procurement decision agent:
1. IntentClassifier
2. Planner
3. ToolRouter / Executor
4. NumericalSafetyGuard (CRITICAL)
5. Synthesizer
"""

import sys
import json
import asyncio
from pathlib import Path

# Add backend, agent, and root to path
root_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(root_dir.parent / "backend"))
sys.path.insert(0, str(root_dir.parent))

from soy_agent.graph import soy_agent_app, stream_soy_agent_execution


def run_agent_cli(query: str = None):
    if not query:
        query = (
            "We have 360 quintals of soybean in plant storage. Mandi spot is ₹4,900/qtl. "
            "Brazilian CIF import quotes are $960/MT at 85.50 INR/USD. "
            "Should we execute domestic procurement now or wait for import parity?"
        )

    print("\n" + "="*80)
    print("🌾 SOYDECISION DESK - 5-NODE QUANTITATIVE LANGGRAPH AGENT")
    print("="*80)
    print(f"User Query: {query}\n")

    initial_state = {
        "query": query,
        "session_id": "cli-test-run",
        "context": {"current_stock": 360.0, "domestic_price": 4900.0, "fob_price_usd": 960.0},
        "trace": [],
        "recalculation_count": 0,
        "tool_traces": [],
        "tool_results": {},
        "ground_truth_numbers": {},
    }

    result = soy_agent_app.invoke(initial_state)

    print("📋 EXECUTION TRACE:")
    for step in result.get("trace", []):
        print(f"  {step}")

    print("\n" + "-"*80)
    print(f"🎯 RECOMMENDATION: {result.get('recommendation_title')}")
    print(f"⭐ CONFIDENCE: {result.get('confidence_score', 0.95) * 100:.0f}% | RISK: {result.get('risk_rating')}")
    print(f"🛡️ SAFETY GUARD: {result.get('safety_guard_report', {}).get('status', 'PASSED')} ({result.get('safety_guard_report', {}).get('verified_numbers_count', 0)} numbers certified)")
    print("-"*80)
    print(f"\n{result.get('final_response')}\n")
    print("="*80)
    return result


async def run_streaming_cli(query: str = None):
    if not query:
        query = "Should we buy Indore domestic soy at 4900 or wait for Brazilian CIF?"
    print("\n--- LIVE STREAMING AGENT EXECUTION ---")
    async for event in stream_soy_agent_execution(query):
        ev_type = event.get("event")
        if ev_type == "node_start":
            print(f"\n>> [{event.get('node')}] {event.get('status')}")
        elif ev_type == "intent_classified":
            print(f"   Intent: {event.get('intent')} (Confidence: {event.get('confidence')})")
        elif ev_type == "plan_created":
            print(f"   Plan Steps:\n{event.get('plan')}")
        elif ev_type == "tool_executed":
            print(f"   Tool Executed: {event.get('tool')}")
        elif ev_type == "safety_guard_audit":
            print(f"   Safety Audit Report: {event.get('report', {}).get('status')}")
        elif ev_type == "token":
            print(event.get("chunk"), end="", flush=True)
        elif ev_type == "complete":
            print(f"\n\n[Done] Status: Complete")


if __name__ == "__main__":
    user_q = sys.argv[1] if len(sys.argv) > 1 else None
    run_agent_cli(user_q)
