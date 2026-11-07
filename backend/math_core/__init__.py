"""
SoyDecision Desk - Pure Python Math Core
Deterministic, fully audited mathematical modules for agricultural commodity procurement,
landed costs, Holt-Winters econometric forecasting, inventory optimization,
procurement timing signals, and multi-factor macro scenario stress testing.

Rule: All calculations are executed exclusively by these pure Python functions.
No LLM calculates numbers.
"""

from .landed_cost import (
    calculate_domestic_landed_cost,
    calculate_international_landed_cost,
)
from .forecasting import (
    holt_winters_forecast,
    auto_holt_winters,
    calculate_forecast_metrics,
)
from .inventory import (
    calculate_safety_stock,
    calculate_reorder_point,
    calculate_economic_order_quantity,
    evaluate_inventory_position,
)
from .timing_signal import (
    generate_timing_signal,
)
from .scenario import (
    stress_test_procurement_scenarios,
    WEATHER_SHOCK_MULTIPLIERS,
)

__all__ = [
    # Landed Cost
    "calculate_domestic_landed_cost",
    "calculate_international_landed_cost",
    # Forecasting
    "holt_winters_forecast",
    "auto_holt_winters",
    "calculate_forecast_metrics",
    # Inventory
    "calculate_safety_stock",
    "calculate_reorder_point",
    "calculate_economic_order_quantity",
    "evaluate_inventory_position",
    # Timing Signal
    "generate_timing_signal",
    # Scenario Stress Testing
    "stress_test_procurement_scenarios",
    "WEATHER_SHOCK_MULTIPLIERS",
]

