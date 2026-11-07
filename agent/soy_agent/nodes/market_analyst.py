from soy_agent.state import AgentState

def market_analyst_node(state: AgentState) -> AgentState:
    """Inspects price quotes and sets market benchmarks."""
    trace = state.get("trace", [])
    trace.append("[MarketAnalystNode] Loading front-month CBOT benchmark quotes.")

    # Defaults or injected parameters
    bean_price = state.get("bean_price") or 10.245
    meal_price = state.get("meal_price") or 314.80
    oil_price = state.get("oil_price") or 44.65
    basis_soybean = state.get("basis_soybean") or -0.15

    state["bean_price"] = bean_price
    state["meal_price"] = meal_price
    state["oil_price"] = oil_price
    state["basis_soybean"] = basis_soybean

    trace.append(f"[MarketAnalystNode] ZS: ${bean_price}/bu, ZM: ${meal_price}/ton, ZL: {oil_price}c/lb, Basis: {basis_soybean*100:+.0f}c")
    state["trace"] = trace
    return state

