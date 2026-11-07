from soy_agent.state import AgentState

def router_node(state: AgentState) -> AgentState:
    """Classifies user intent and sets initial state parameters."""
    query = state.get("query", "").lower()
    trace = state.get("trace", [])
    trace.append(f"[RouterNode] Analyzing user request: '{query[:60]}...'")

    if any(k in query for k in ["crush", "margin", "gpm", "oil share", "yield", "spread"]):
        route = "crush_analysis"
    elif any(k in query for k in ["basis", "freight", "cif", "nola", "river", "elevator"]):
        route = "basis_arbitrage"
    elif any(k in query for k in ["var", "risk", "hedge", "contracts", "monte carlo", "shortfall"]):
        route = "risk_hedging"
    else:
        route = "full_evaluation"

    trace.append(f"[RouterNode] Categorized route as: {route}")
    state["route"] = route
    state["trace"] = trace
    return state

