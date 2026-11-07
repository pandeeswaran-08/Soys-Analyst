from soy_agent.state import AgentState
from soy_agent.tools.crush_tools import calculate_crush_margin_tool
from soy_agent.tools.basis_tools import analyze_basis_tool
from soy_agent.tools.risk_tools import calculate_var_tool, hedge_sizing_tool

def math_evaluator_node(state: AgentState) -> AgentState:
    """Executes the pure Python math core algorithms."""
    trace = state.get("trace", [])
    trace.append("[MathEvaluatorNode] Invoking Pure Python Math Core tools...")

    bean_p = state.get("bean_price", 10.245)
    meal_p = state.get("meal_price", 314.80)
    oil_p = state.get("oil_price", 44.65)
    basis_b = state.get("basis_soybean", -0.15)

    # 1. Crush calculations
    crush_res = calculate_crush_margin_tool.invoke({
        "soybean_price_bu": bean_p,
        "meal_price_ton": meal_p,
        "oil_price_lb_cents": oil_p,
        "operating_crush_cost_bu": 0.75,
        "basis_soybean_bu": basis_b,
    })
    state["crush_metrics"] = crush_res
    trace.append(f"[MathEvaluatorNode] Calculated Cash GPM: ${crush_res['cash_gpm_dollars_per_bu']:.2f}/bu (Board Crush: {crush_res['board_crush_cents_per_bu']}c/bu)")

    # 2. Basis calculations
    basis_res = analyze_basis_tool.invoke({
        "current_basis": basis_b * 100.0,
    })
    state["basis_analysis"] = basis_res
    trace.append(f"[MathEvaluatorNode] Basis Percentile Rank: {basis_res['percentile_rank']}% ({basis_res['interpretation']})")

    # 3. Risk & Sizing calculations
    var_res = calculate_var_tool.invoke({
        "portfolio_value": 5_000_000.0,
        "daily_volatility": 0.018,
    })
    state["risk_metrics"] = var_res

    cbot_orders = hedge_sizing_tool.invoke({
        "bushels": 100_000.0,
        "hedge_ratio": 0.75,
    })
    state["cbot_orders"] = cbot_orders
    trace.append(f"[MathEvaluatorNode] CBOT Contract Allocation: {cbot_orders['spread_ratio_rule']} ({cbot_orders['contracts']['soybeans_zs']['contract_count']} ZS Long, {cbot_orders['contracts']['soybean_meal_zm']['contract_count']} ZM Short, {cbot_orders['contracts']['soybean_oil_zl']['contract_count']} ZL Short)")

    state["trace"] = trace
    return state

