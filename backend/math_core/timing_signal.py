"""
Procurement Timing & Market Decision Signal Engine
Pure, deterministic mathematical rules determining Buy / Wait / Monitor decisions
derived from forward price forecasts, cost budget advantages, inventory runways, and carrying costs.

All functions are side-effect free, fully typed, and return clear dictionaries.
"""

from typing import List, Dict, Any, Optional, Literal
import numpy as np


def generate_timing_signal(
    current_price: float,
    forecasted_prices: List[float],
    target_cost_budget: float,
    current_stock_days: float,
    reorder_threshold_days: float = 20.0,
    critical_stock_threshold_days: float = 7.0,
    daily_carrying_cost_rate: float = 0.0004,  # ~14.6% annualized carrying cost
    forecast_confidence: float = 0.90,
    price_drop_significance_pct: float = 2.0,
    price_rally_significance_pct: float = 2.5,
) -> Dict[str, Any]:
    """
    Evaluates optimal procurement timing (Buy, Wait, Monitor) for commodity buyers.

    Formulas:
        Cost Advantage (%) = ((Target Budget - Current Price) / Target Budget) * 100
        Expected Forward Change (%) = ((Mean Forecast - Current Price) / Current Price) * 100
        Net Holding Arbitrage = (P_forecast_avg - Current Price) - (Current Price * Daily Carrying Cost * Horizon Days)

    Decision Logic:
        1. CRITICAL STOCK:
           If Current Stock Days <= Critical Threshold -> BUY_MANDATORY (100% order).
        2. DOWNTREND & AMPLE INVENTORY:
           If Expected Forward Change <= -Price Drop Significance AND Current Stock > Reorder Threshold -> WAIT_PRICE_DROP (0% order).
        3. UPTREND & FAVORABLE COST:
           If Cost Advantage >= 0 AND Expected Forward Change >= Price Rally Significance AND Net Holding Arbitrage > 0 -> BUY_AGGRESSIVE (100% order).
        4. MODERATE BUY:
           If Cost Advantage > 0 OR Current Stock <= Reorder Threshold -> BUY_SCALE_IN (50% order).
        5. RANGE-BOUND:
           Otherwise -> MONITOR_NEUTRAL (0-25% order).

    Args:
        current_price: Current prompt cash/mandi/import market price (> 0)
        forecasted_prices: Sequence of forecasted prices over the planning horizon (length >= 1)
        target_cost_budget: Internal budget ceiling or benchmark reference price (> 0)
        current_stock_days: Current days of inventory on hand (>= 0)
        reorder_threshold_days: Days of inventory triggering standard replenishment
        critical_stock_threshold_days: Safety stock floor triggering emergency replenishment
        daily_carrying_cost_rate: Daily cost of holding 1 unit of commodity (carrying interest + storage)
        forecast_confidence: Statistical confidence of the forecast model (0.0 to 1.0)
        price_drop_significance_pct: Minimum expected % price drop to justify waiting
        price_rally_significance_pct: Minimum expected % price rise to trigger aggressive forward buying

    Returns:
        Structured signal dictionary with action recommendation, cost metrics, and mathematical rationale.
    """
    if current_price <= 0:
        raise ValueError("current_price must be positive")
    if target_cost_budget <= 0:
        raise ValueError("target_cost_budget must be positive")
    if not forecasted_prices:
        raise ValueError("forecasted_prices list cannot be empty")
    if current_stock_days < 0:
        raise ValueError("current_stock_days cannot be negative")

    f_arr = np.array(forecasted_prices, dtype=float)
    mean_forecast = float(np.mean(f_arr))
    min_forecast = float(np.min(f_arr))
    max_forecast = float(np.max(f_arr))
    horizon_days = len(forecasted_prices)

    # 1. Cost advantage vs internal benchmark budget
    cost_advantage_amount = target_cost_budget - current_price
    cost_advantage_pct = (cost_advantage_amount / target_cost_budget) * 100.0

    # 2. Expected forward price shift
    price_change_amount = mean_forecast - current_price
    price_change_pct = (price_change_amount / current_price) * 100.0
    min_price_change_pct = ((min_forecast - current_price) / current_price) * 100.0

    # 3. Holding cost arbitrage
    total_carrying_cost = current_price * daily_carrying_cost_rate * horizon_days
    net_holding_arbitrage = price_change_amount - total_carrying_cost

    # 4. Decision Rules Engine
    rationales: List[str] = []
    signal: Literal["BUY_MANDATORY", "BUY_AGGRESSIVE", "BUY_SCALE_IN", "WAIT_PRICE_DROP", "MONITOR_NEUTRAL"]
    action: str
    recommended_order_fraction: float
    urgency: str

    if current_stock_days <= critical_stock_threshold_days:
        signal = "BUY_MANDATORY"
        action = "PROCURE_IMMEDIATELY_FULL"
        recommended_order_fraction = 1.0
        urgency = "CRITICAL"
        rationales.append(
            f"Inventory level ({current_stock_days:.1f} days) is at or below critical threshold ({critical_stock_threshold_days:.1f} days). Stockout prevention takes operational precedence."
        )
    elif price_change_pct <= -price_drop_significance_pct and current_stock_days > reorder_threshold_days:
        signal = "WAIT_PRICE_DROP"
        action = "DEFER_PROCUREMENT"
        recommended_order_fraction = 0.0
        urgency = "LOW"
        savings_est = abs(price_change_amount)
        rationales.append(
            f"Forecast projects price decline of {abs(price_change_pct):.2f}% (approx {savings_est:.2f}/unit lower). Current stock runway of {current_stock_days:.1f} days safely permits waiting."
        )
        if min_forecast < current_price:
            rationales.append(f"Projected trough price: {min_forecast:.2f} ({min_price_change_pct:.2f}% discount).")
    elif cost_advantage_pct >= 0 and price_change_pct >= price_rally_significance_pct and net_holding_arbitrage > 0:
        signal = "BUY_AGGRESSIVE"
        action = "PROCURE_FULL_ALLOCATION"
        recommended_order_fraction = 1.0
        urgency = "HIGH"
        rationales.append(
            f"Current spot price offers a {cost_advantage_pct:.2f}% discount to budget and prices are forecasted to rally by {price_change_pct:.2f}%."
        )
        rationales.append(
            f"Net holding arbitrage is positive (+{net_holding_arbitrage:.2f}/unit) after deducting {total_carrying_cost:.2f}/unit carrying cost."
        )
    elif current_stock_days <= reorder_threshold_days or cost_advantage_pct > 0:
        signal = "BUY_SCALE_IN"
        action = "PROCURE_TRANCHE"
        recommended_order_fraction = 0.5
        urgency = "MEDIUM"
        if current_stock_days <= reorder_threshold_days:
            rationales.append(
                f"Stock runway ({current_stock_days:.1f} days) is approaching reorder threshold ({reorder_threshold_days:.1f} days)."
            )
        if cost_advantage_pct > 0:
            rationales.append(
                f"Current market offers favorable budget clearance (+{cost_advantage_pct:.2f}% cost advantage)."
            )
    else:
        signal = "MONITOR_NEUTRAL"
        action = "MAINTAIN_MONITORING"
        recommended_order_fraction = 0.0
        urgency = "LOW"
        rationales.append(
            f"Prices are range-bound ({price_change_pct:+.2f}% expected change) and stock runway ({current_stock_days:.1f} days) is sufficient. Maintain observation."
        )

    return {
        "signal": signal,
        "action": action,
        "urgency_level": urgency,
        "recommended_order_fraction": recommended_order_fraction,
        "pricing_analysis": {
            "current_price": round(current_price, 4),
            "target_cost_budget": round(target_cost_budget, 4),
            "cost_advantage_amount": round(cost_advantage_amount, 4),
            "cost_advantage_pct": round(cost_advantage_pct, 2),
            "is_below_budget": bool(cost_advantage_amount > 0),
        },
        "forecast_analysis": {
            "mean_forecast_price": round(mean_forecast, 4),
            "min_forecast_price": round(min_forecast, 4),
            "max_forecast_price": round(max_forecast, 4),
            "expected_price_change_amount": round(price_change_amount, 4),
            "expected_price_change_pct": round(price_change_pct, 2),
            "forecast_horizon_days": horizon_days,
            "forecast_confidence": forecast_confidence,
        },
        "holding_cost_arbitrage": {
            "total_carrying_cost_per_unit": round(total_carrying_cost, 4),
            "net_holding_arbitrage_gain_per_unit": round(net_holding_arbitrage, 4),
            "is_arbitrage_profitable": bool(net_holding_arbitrage > 0),
        },
        "inventory_context": {
            "current_stock_days": round(current_stock_days, 1),
            "reorder_threshold_days": reorder_threshold_days,
            "critical_stock_threshold_days": critical_stock_threshold_days,
        },
        "rationales": rationales,
    }

