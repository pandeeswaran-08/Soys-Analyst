"""
SoyDecision Desk - Pure Python Math Core
High-performance quantitative engine for agricultural commodity crush margins,
econometrics, basis pricing, risk analytics, and hedging optimization.
"""

from .crush_margin import (
    calculate_board_crush,
    calculate_gross_processing_margin,
    calculate_oil_share,
    calculate_crush_sensitivities,
    calculate_comprehensive_crush,
)
from .basis_pricing import (
    calculate_basis,
    calculate_net_delivered_price,
    analyze_basis_historical_percentile,
)
from .econometrics import (
    forecast_arima,
    test_cointegration,
    calculate_rolling_volatility,
    test_stationarity_adf,
)
from .risk_analytics import (
    calculate_parametric_var,
    calculate_historical_var,
    calculate_expected_shortfall,
    run_monte_carlo_crush_sim,
    run_stress_test,
)
from .hedging import (
    calculate_optimal_hedge_ratio,
    calculate_cbot_contracts,
    evaluate_hedge_effectiveness,
)

__all__ = [
    "calculate_board_crush",
    "calculate_gross_processing_margin",
    "calculate_oil_share",
    "calculate_crush_sensitivities",
    "calculate_comprehensive_crush",
    "calculate_basis",
    "calculate_net_delivered_price",
    "analyze_basis_historical_percentile",
    "forecast_arima",
    "test_cointegration",
    "calculate_rolling_volatility",
    "test_stationarity_adf",
    "calculate_parametric_var",
    "calculate_historical_var",
    "calculate_expected_shortfall",
    "run_monte_carlo_crush_sim",
    "run_stress_test",
    "calculate_optimal_hedge_ratio",
    "calculate_cbot_contracts",
    "evaluate_hedge_effectiveness",
]

