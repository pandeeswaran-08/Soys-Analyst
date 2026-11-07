from typing import Dict, Any
from langchain_core.tools import tool

# Import math functions directly from backend math core or standalone implementation
try:
    from app.math.crush_margin import calculate_comprehensive_crush
except ImportError:
    # Standalone fallback if invoked in independent environment
    import sys
    from pathlib import Path
    backend_path = Path(__file__).resolve().parents[3] / "backend"
    if str(backend_path) not in sys.path:
        sys.path.insert(0, str(backend_path))
    from app.math.crush_margin import calculate_comprehensive_crush


@tool
def calculate_crush_margin_tool(
    soybean_price_bu: float = 10.25,
    meal_price_ton: float = 312.0,
    oil_price_lb_cents: float = 44.5,
    operating_crush_cost_bu: float = 0.75,
    basis_soybean_bu: float = -0.15,
) -> Dict[str, Any]:
    """
    Calculates Board Crush, Cash Gross Processing Margin (GPM), Net Processing Margin,
    Oil Share percentage, and margin sensitivity Greeks.
    """
    return calculate_comprehensive_crush(
        soybean_price_bu=soybean_price_bu,
        meal_price_ton=meal_price_ton,
        oil_price_lb_cents=oil_price_lb_cents,
        operating_crush_cost_bu=operating_crush_cost_bu,
        basis_soybean_bu=basis_soybean_bu,
    )

