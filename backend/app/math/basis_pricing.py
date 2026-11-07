"""
Agricultural Basis Pricing and Spatial Arbitrage Engine
Calculates local elevator basis, export parity (CIF NOLA, PNW),
freight-adjusted net prices, and historical basis distribution percentiles.
"""

from typing import Dict, Any, List
import numpy as np


def calculate_basis(cash_price: float, futures_price: float) -> float:
    """
    Basis = Cash Price - Futures Price
    Positive = Cash is at a premium to futures ('over')
    Negative = Cash is at a discount to futures ('under')
    """
    return round(cash_price - futures_price, 4)


def calculate_net_delivered_price(
    destination_cif_price: float,
    freight_cost: float,
    elevation_handling_cost: float = 0.05,
    shrinkage_loss_percent: float = 0.002,
) -> Dict[str, float]:
    """
    Calculates the net FOB origin elevator price backing out from export port (e.g. CIF NOLA).
    Net Price = Destination CIF - Freight - Elevation - (Shrinkage * CIF)
    """
    shrink_cost = destination_cif_price * shrinkage_loss_percent
    total_deductions = freight_cost + elevation_handling_cost + shrink_cost
    net_origin_price = destination_cif_price - total_deductions
    return {
        "destination_cif_price": round(destination_cif_price, 4),
        "freight_cost": round(freight_cost, 4),
        "elevation_handling_cost": round(elevation_handling_cost, 4),
        "shrinkage_loss_cost": round(shrink_cost, 4),
        "total_transport_deduction": round(total_deductions, 4),
        "net_origin_price": round(net_origin_price, 4),
    }


def analyze_basis_historical_percentile(
    current_basis: float,
    historical_basis_series: List[float],
) -> Dict[str, Any]:
    """
    Analyzes current basis against a historical distribution (e.g., 3-year or 5-year average).
    Computes Z-score, percentile rank, min, max, mean, standard deviation.
    """
    arr = np.array(historical_basis_series)
    if len(arr) == 0:
        return {
            "current_basis": current_basis,
            "mean": current_basis,
            "percentile": 50.0,
            "z_score": 0.0,
            "interpretation": "Insufficient historical data",
        }

    mean = float(np.mean(arr))
    std = float(np.std(arr)) if np.std(arr) > 1e-6 else 1.0
    z_score = float((current_basis - mean) / std)
    percentile = float(np.sum(arr <= current_basis) / len(arr) * 100.0)

    if percentile >= 80:
        signal = "Strong basis (Historically expensive / Sell cash or lock basis)"
    elif percentile <= 20:
        signal = "Weak basis (Historically cheap / Buy cash or defer basis fix)"
    else:
        signal = "Neutral basis (In line with seasonal distribution)"

    return {
        "current_basis": round(current_basis, 4),
        "mean_basis": round(mean, 4),
        "std_dev": round(std, 4),
        "min_basis": round(float(np.min(arr)), 4),
        "max_basis": round(float(np.max(arr)), 4),
        "percentile_rank": round(percentile, 1),
        "z_score": round(z_score, 2),
        "interpretation": signal,
    }

