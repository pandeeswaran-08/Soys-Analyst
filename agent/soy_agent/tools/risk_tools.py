from typing import Dict, Any, List
from langchain_core.tools import tool

try:
    from app.math.risk_analytics import calculate_parametric_var, run_monte_carlo_crush_sim, run_stress_test
    from app.math.hedging import calculate_optimal_hedge_ratio, calculate_cbot_contracts
except ImportError:
    import sys
    from pathlib import Path
    backend_path = Path(__file__).resolve().parents[3] / "backend"
    if str(backend_path) not in sys.path:
        sys.path.insert(0, str(backend_path))
    from app.math.risk_analytics import calculate_parametric_var, run_monte_carlo_crush_sim, run_stress_test
    from app.math.hedging import calculate_optimal_hedge_ratio, calculate_cbot_contracts


@tool
def calculate_var_tool(
    portfolio_value: float = 5_000_000.0,
    daily_volatility: float = 0.018,
    holding_period_days: int = 1,
) -> Dict[str, float]:
    """
    Computes Parametric Value-at-Risk (95% and 99% confidence) for the commodity inventory book.
    """
    v95 = calculate_parametric_var(portfolio_value, daily_volatility, holding_period_days, 0.95)
    v99 = calculate_parametric_var(portfolio_value, daily_volatility, holding_period_days, 0.99)
    return {
        "var_95": v95,
        "var_99": v99,
        "expected_shortfall_95": round(v95 * 1.25, 2),
    }


@tool
def hedge_sizing_tool(
    bushels: float = 100_000.0,
    hedge_ratio: float = 0.75,
) -> Dict[str, Any]:
    """
    Computes exact Chicago Board of Trade (CBOT) contract quantities (Soybean ZS,
    Meal ZM, Oil ZL) to hedge a commercial crushing run.
    """
    return calculate_cbot_contracts(bushels, hedge_ratio)

