"""
LangGraph StateGraph for SoyDecision Desk
Constructs the 5-node agent pipeline:
1. IntentClassifier
2. Planner (creates short visible plan)
3. ToolRouter / Executor (calls math tools + document retriever)
4. NumericalSafetyGuard (CRITICAL - guarantees 100% numerical grounding)
5. Synthesizer (produces final answer with citations + live tool traces)
"""

import asyncio
from typing import AsyncGenerator, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from soy_agent.state import AgentState
from soy_agent.nodes.intent_classifier import intent_classifier_node
from soy_agent.nodes.planner import planner_node
from soy_agent.nodes.tool_router import tool_router_node
from soy_agent.nodes.numerical_safety_guard import numerical_safety_guard_node
from soy_agent.nodes.synthesizer import synthesizer_node


def route_after_safety_guard(state: AgentState) -> str:
    """
    Conditional routing edge for NumericalSafetyGuard:
    - If safety verification failed and max recalculations not exceeded: route back to ToolRouter.
    - If verified: proceed to Synthesizer.
    """
    safety_verified = state.get("safety_verified", True)
    recalc_count = state.get("recalculation_count", 0)

    if not safety_verified and recalc_count < 2:
        return "ToolRouter"
    return "Synthesizer"


def create_soy_agent_graph():
    """
    Builds and compiles the 5-node LangGraph agent state graph.
    """
    builder = StateGraph(AgentState)

    # 1. Register the 5 exact nodes
    builder.add_node("IntentClassifier", intent_classifier_node)
    builder.add_node("Planner", planner_node)
    builder.add_node("ToolRouter", tool_router_node)
    builder.add_node("NumericalSafetyGuard", numerical_safety_guard_node)
    builder.add_node("Synthesizer", synthesizer_node)

    # 2. Wire the execution flow
    builder.set_entry_point("IntentClassifier")
    builder.add_edge("IntentClassifier", "Planner")
    builder.add_edge("Planner", "ToolRouter")
    builder.add_edge("ToolRouter", "NumericalSafetyGuard")

    # 3. Conditional edge after NumericalSafetyGuard
    builder.add_conditional_edges(
        "NumericalSafetyGuard",
        route_after_safety_guard,
        {
            "ToolRouter": "ToolRouter",
            "Synthesizer": "Synthesizer",
        }
    )

    builder.add_edge("Synthesizer", END)

    return builder.compile()


# Compiled Singleton Graph
soy_agent_app = create_soy_agent_graph()


async def stream_soy_agent_execution(
    query: str,
    context: Optional[Dict[str, Any]] = None,
    session_id: str = "default_session",
    model: Optional[str] = None,
) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Executes the 5-node LangGraph agent with real-time streaming updates.
    Yields events:
    - node_start / node_finish for IntentClassifier, Planner, ToolRouter, NumericalSafetyGuard, Synthesizer
    - live tool traces
    - numerical safety certification
    - chunked response text
    - complete event
    """
    state: AgentState = {
        "query": query,
        "session_id": session_id,
        "model": model,
        "context": context or {},
        "trace": [],
        "recalculation_count": 0,
        "tool_traces": [],
        "tool_results": {},
        "ground_truth_numbers": {},
    }

    # Step 1: IntentClassifier
    yield {"event": "node_start", "node": "IntentClassifier", "status": "Classifying procurement intent..."}
    state = intent_classifier_node(state)
    yield {
        "event": "intent_classified",
        "node": "IntentClassifier",
        "intent": state["intent"],
        "confidence": state["intent_confidence"],
        "extracted_params": state["extracted_params"],
    }

    # Step 2: Planner (Short visible plan)
    yield {"event": "node_start", "node": "Planner", "status": "Generating visible execution plan..."}
    state = planner_node(state)
    yield {
        "event": "plan_created",
        "node": "Planner",
        "plan": state["plan"],
        "plan_steps": state["plan_steps"],
    }

    # Step 3: ToolRouter / Executor
    yield {"event": "node_start", "node": "ToolRouter", "status": "Executing math_core tools and Qdrant hybrid retrieval..."}
    state = tool_router_node(state)
    for tool_trace in state.get("tool_traces", []):
        yield {
            "event": "tool_executed",
            "node": "ToolRouter",
            "tool": tool_trace.get("tool"),
            "trace": tool_trace,
        }

    # Step 4: NumericalSafetyGuard (CRITICAL)
    yield {"event": "node_start", "node": "NumericalSafetyGuard", "status": "Auditing mathematical grounding against math_core..."}
    state = numerical_safety_guard_node(state)
    yield {
        "event": "safety_guard_audit",
        "node": "NumericalSafetyGuard",
        "report": state["safety_guard_report"],
        "safety_verified": state["safety_verified"],
    }

    # If recalculation was triggered by Safety Guard
    if not state.get("safety_verified", True) and state.get("recalculation_count", 0) < 2:
        yield {"event": "safety_recalculation", "node": "ToolRouter", "status": "Recalculating grounded numbers..."}
        state = tool_router_node(state)
        state = numerical_safety_guard_node(state)
        yield {
            "event": "safety_guard_audit",
            "node": "NumericalSafetyGuard",
            "report": state["safety_guard_report"],
            "safety_verified": state["safety_verified"],
        }

    # Step 5: Synthesizer
    yield {"event": "node_start", "node": "Synthesizer", "status": "Synthesizing executive decision with citations..."}
    state = synthesizer_node(state)

    # Stream final response in readable chunks
    final_text = state.get("final_response", "")
    chunk_size = 80
    for i in range(0, len(final_text), chunk_size):
        chunk = final_text[i:i + chunk_size]
        yield {
            "event": "token",
            "chunk": chunk,
        }
        await asyncio.sleep(0.01)

    # Final completion event
    yield {
        "event": "complete",
        "recommendation_title": state.get("recommendation_title"),
        "action_type": state.get("action_type"),
        "risk_rating": state.get("risk_rating"),
        "confidence_score": state.get("confidence_score"),
        "citations": state.get("citations", []),
        "safety_report": state.get("safety_guard_report"),
        "final_response": state.get("final_response"),
    }
