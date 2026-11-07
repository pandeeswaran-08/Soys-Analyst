from typing import Dict, Any, List
from langchain_core.tools import tool

try:
    from app.math.basis_pricing import calculate_basis, calculate_net_delivered_price, analyze_basis_historical_percentile
except ImportError:
    import sys
    from pathlib import Path
    backend_path = Path(__file__).resolve().parents[3] / "backend"
    if str(backend_path) not in sys.path:
        sys.path.insert(0, str(backend_path))
    from app.math.basis_pricing import calculate_basis, calculate_net_delivered_price, analyze_basis_historical_percentile


@tool
def analyze_basis_tool(
    current_basis: float = -18.0,
    historical_bids: List[float] = [-35.0, -30.0, -25.0, -20.0, -18.0, -15.0, -10.0, 0.0],
) -> Dict[str, Any]:
    """
    Evaluates current cash basis vs historical seasonal distribution to identify
    whether local basis is cheap (buy cash) or rich (sell cash/lock basis).
    """
    return analyze_basis_historical_percentile(current_basis, historical_bids)


@tool
def spatial_arbitrage_tool(
    destination_cif: float = 10.95,
    freight_rate: float = 0.55,
) -> Dict[str, Any]:
    """
    Computes origin netback price from export destination (CIF NOLA) backing out
    barge freight, elevation, and shrinkage.
    """
    return calculate_net_delivered_price(destination_cif, freight_rate)

