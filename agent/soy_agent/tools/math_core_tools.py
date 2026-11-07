"""
LangGraph Agent Tools wrapping the pure Python math_core engine.
Provides agent nodes with direct tool execution access for:
- Domestic & International landed costs
- Holt-Winters forecasting
- Safety stock, ROP, EOQ, inventory position
- Buy / Wait / Monitor timing signals
- Multi-factor macro scenario stress tests
"""

import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_path = Path(__file__).resolve().parents[3] / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.tools.math_tools import (
    calculate_domestic_landed_cost_tool,
    calculate_international_landed_cost_tool,
    forecast_price_tool,
    auto_forecast_price_tool,
    calculate_safety_stock_tool,
    calculate_reorder_point_tool,
    calculate_economic_order_quantity_tool,
    evaluate_inventory_position_tool,
    generate_timing_signal_tool,
    stress_test_procurement_tool,
    ALL_MATH_CORE_TOOLS,
)

__all__ = [
    "calculate_domestic_landed_cost_tool",
    "calculate_international_landed_cost_tool",
    "forecast_price_tool",
    "auto_forecast_price_tool",
    "calculate_safety_stock_tool",
    "calculate_reorder_point_tool",
    "calculate_economic_order_quantity_tool",
    "evaluate_inventory_position_tool",
    "generate_timing_signal_tool",
    "stress_test_procurement_tool",
    "ALL_MATH_CORE_TOOLS",
]

