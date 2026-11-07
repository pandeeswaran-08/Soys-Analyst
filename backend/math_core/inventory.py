"""
Inventory Optimization and Stock Replenishment Mathematical Engine
Pure, deterministic mathematical formulas for Safety Stock, Reorder Point (ROP),
Economic Order Quantity (EOQ), and multi-echelon stock health diagnostics.

All functions are side-effect free, fully typed, and return clear dictionaries.
"""

from typing import Dict, Any, Optional
import numpy as np
import scipy.stats as stats


def calculate_safety_stock(
    average_daily_demand: float,
    demand_std_dev: float,
    lead_time_days: float,
    lead_time_std_dev: float = 0.0,
    service_level: float = 0.95,
) -> Dict[str, Any]:
    """
    Computes statistical safety stock protecting against demand and lead-time variability.

    Formulas:
        Case 1: Constant lead time (sigma_L = 0):
            SS = Z * sigma_D * sqrt(L)

        Case 2: Constant demand (sigma_D = 0):
            SS = Z * D_avg * sigma_L

        Case 3: Both demand and lead time variable:
            SS = Z * sqrt( (L * sigma_D^2) + (D_avg^2 * sigma_L^2) )

        Buffer Coverage (days) = SS / D_avg

    Args:
        average_daily_demand: Expected units/MT consumed per day (D_avg > 0)
        demand_std_dev: Daily demand standard deviation (sigma_D >= 0)
        lead_time_days: Average supplier delivery lead time in days (L > 0)
        lead_time_std_dev: Lead time standard deviation in days (sigma_L >= 0)
        service_level: Desired cycle service level fraction (0 < SL < 1, e.g. 0.95 for 95%)

    Returns:
        Breakdown dictionary with safety stock quantity, buffer days, Z-score, and variance breakdown.
    """
    if average_daily_demand <= 0:
        raise ValueError("average_daily_demand must be positive")
    if demand_std_dev < 0 or lead_time_std_dev < 0:
        raise ValueError("Standard deviations cannot be negative")
    if lead_time_days <= 0:
        raise ValueError("lead_time_days must be positive")
    if service_level <= 0.5 or service_level >= 1.0:
        raise ValueError("service_level must be between 0.5 and 1.0 exclusive")

    # Z-score corresponding to the normal cumulative distribution
    z_score = float(stats.norm.ppf(service_level))

    # Variance components
    demand_variance_component = lead_time_days * (demand_std_dev ** 2)
    lead_time_variance_component = (average_daily_demand ** 2) * (lead_time_std_dev ** 2)
    combined_std_dev = float(np.sqrt(demand_variance_component + lead_time_variance_component))

    safety_stock_units = round(z_score * combined_std_dev, 2)
    buffer_days = round(safety_stock_units / average_daily_demand, 2)

    return {
        "service_level": service_level,
        "service_level_pct": round(service_level * 100.0, 2),
        "z_score": round(z_score, 4),
        "safety_stock_units": safety_stock_units,
        "buffer_coverage_days": buffer_days,
        "variance_breakdown": {
            "demand_variance_contribution": round(demand_variance_component, 2),
            "lead_time_variance_contribution": round(lead_time_variance_component, 2),
            "combined_lead_time_demand_std": round(combined_std_dev, 4),
        },
    }


def calculate_reorder_point(
    average_daily_demand: float,
    lead_time_days: float,
    safety_stock_units: float,
) -> Dict[str, Any]:
    """
    Calculates the inventory Reorder Point (ROP).

    Formula:
        ROP = (Average Daily Demand * Average Lead Time) + Safety Stock
        Lead Time Demand = Average Daily Demand * Average Lead Time

    Args:
        average_daily_demand: Daily demand rate (D_avg > 0)
        lead_time_days: Supplier delivery lead time in days (L > 0)
        safety_stock_units: Buffer stock required (SS >= 0)

    Returns:
        Dictionary with ROP, expected lead time consumption, and safety buffer.
    """
    if average_daily_demand <= 0 or lead_time_days <= 0:
        raise ValueError("Demand and lead time must be positive numbers")
    if safety_stock_units < 0:
        raise ValueError("safety_stock_units cannot be negative")

    lead_time_demand = round(average_daily_demand * lead_time_days, 2)
    reorder_point = round(lead_time_demand + safety_stock_units, 2)

    return {
        "reorder_point_units": reorder_point,
        "lead_time_demand_units": lead_time_demand,
        "safety_stock_buffer_units": round(safety_stock_units, 2),
        "lead_time_days": lead_time_days,
        "average_daily_demand": average_daily_demand,
    }


def calculate_economic_order_quantity(
    annual_demand_units: float,
    fixed_order_cost: float,
    annual_holding_cost_per_unit: float,
    unit_purchase_cost: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Calculates the Economic Order Quantity (EOQ) and total inventory holding/ordering costs.

    Formulas:
        EOQ = sqrt( (2 * D * S) / H )
        Orders per Year (N) = D / EOQ
        Cycle Time between Orders (T_days) = 365 / N
        Annual Ordering Cost = N * S
        Annual Holding Cost = (EOQ / 2) * H
        Total Annual Policy Cost = Annual Ordering Cost + Annual Holding Cost

    Args:
        annual_demand_units: Annual demand in units or MT (D > 0)
        fixed_order_cost: Administrative / logistics setup cost per purchase order (S > 0)
        annual_holding_cost_per_unit: Carrying / warehousing cost per unit per year (H > 0)
        unit_purchase_cost: Optional acquisition cost per unit to compute total annual procurement spend

    Returns:
        Comprehensive dictionary detailing optimal lot size, orders per year, cycle time, and cost breakdown.
    """
    if annual_demand_units <= 0:
        raise ValueError("annual_demand_units must be positive")
    if fixed_order_cost <= 0:
        raise ValueError("fixed_order_cost must be positive")
    if annual_holding_cost_per_unit <= 0:
        raise ValueError("annual_holding_cost_per_unit must be positive")

    eoq = float(np.sqrt((2.0 * annual_demand_units * fixed_order_cost) / annual_holding_cost_per_unit))
    eoq_rounded = round(eoq, 2)

    orders_per_year = round(annual_demand_units / eoq, 2)
    cycle_time_days = round(365.0 / (annual_demand_units / eoq), 1)

    annual_ordering_cost = round((annual_demand_units / eoq) * fixed_order_cost, 2)
    annual_holding_cost = round((eoq / 2.0) * annual_holding_cost_per_unit, 2)
    total_inventory_cost = round(annual_ordering_cost + annual_holding_cost, 2)

    result = {
        "economic_order_quantity_units": eoq_rounded,
        "orders_per_year": orders_per_year,
        "order_cycle_time_days": cycle_time_days,
        "annual_ordering_cost": annual_ordering_cost,
        "annual_holding_cost": annual_holding_cost,
        "total_annual_inventory_cost": total_inventory_cost,
        "average_inventory_level_units": round(eoq / 2.0, 2),
    }

    if unit_purchase_cost is not None and unit_purchase_cost > 0:
        annual_material_spend = round(annual_demand_units * unit_purchase_cost, 2)
        result["annual_material_procurement_spend"] = annual_material_spend
        result["total_procurement_and_inventory_spend"] = round(annual_material_spend + total_inventory_cost, 2)

    return result


def evaluate_inventory_position(
    current_stock_on_hand: float,
    stock_in_transit: float,
    allocated_stock: float,
    average_daily_demand: float,
    lead_time_days: float,
    demand_std_dev: float = 0.0,
    lead_time_std_dev: float = 0.0,
    service_level: float = 0.95,
    fixed_order_cost: float = 5000.0,
    annual_holding_cost_per_unit: float = 120.0,
) -> Dict[str, Any]:
    """
    Comprehensive inventory status evaluator combining Safety Stock, ROP, and EOQ.

    Formula:
        Net Inventory Position = On Hand + In Transit - Allocated
        Stock Runway (Days) = On Hand / Daily Demand
        Effective Runway (Days) = Net Position / Daily Demand

    Returns:
        Diagnostic status ('CRITICAL_STOCKOUT_RISK', 'REORDER_NOW', 'HEALTHY', 'OVERSTOCKED'),
        runway days, safety metrics, and suggested replenishment quantity.
    """
    if current_stock_on_hand < 0:
        raise ValueError("current_stock_on_hand cannot be negative")
    if average_daily_demand <= 0:
        raise ValueError("average_daily_demand must be positive")

    # 1. Compute safety stock & ROP
    ss_data = calculate_safety_stock(
        average_daily_demand=average_daily_demand,
        demand_std_dev=demand_std_dev if demand_std_dev > 0 else (average_daily_demand * 0.15),
        lead_time_days=lead_time_days,
        lead_time_std_dev=lead_time_std_dev,
        service_level=service_level,
    )
    ss_units = ss_data["safety_stock_units"]

    rop_data = calculate_reorder_point(
        average_daily_demand=average_daily_demand,
        lead_time_days=lead_time_days,
        safety_stock_units=ss_units,
    )
    rop_units = rop_data["reorder_point_units"]

    # 2. Compute EOQ
    annual_demand = average_daily_demand * 365.0
    eoq_data = calculate_economic_order_quantity(
        annual_demand_units=annual_demand,
        fixed_order_cost=fixed_order_cost,
        annual_holding_cost_per_unit=annual_holding_cost_per_unit,
    )
    eoq_units = eoq_data["economic_order_quantity_units"]

    # 3. Position and runway
    net_position = round(current_stock_on_hand + stock_in_transit - allocated_stock, 2)
    on_hand_runway_days = round(current_stock_on_hand / average_daily_demand, 1)
    net_runway_days = round(net_position / average_daily_demand, 1)

    # 4. Status classification
    suggested_order_qty = 0.0
    if net_position < ss_units:
        status = "CRITICAL_STOCKOUT_RISK"
        action = "EMERGENCY_REORDER"
        suggested_order_qty = round(max(eoq_units, rop_units - net_position), 2)
    elif net_position <= rop_units:
        status = "REORDER_NOW"
        action = "PLACE_STANDARD_ORDER"
        suggested_order_qty = eoq_units
    elif net_position <= (rop_units + eoq_units * 1.5):
        status = "HEALTHY"
        action = "NO_ORDER_NEEDED"
    else:
        status = "OVERSTOCKED"
        action = "HOLD_PROCUREMENT"

    return {
        "current_stock_on_hand": round(current_stock_on_hand, 2),
        "stock_in_transit": round(stock_in_transit, 2),
        "allocated_stock": round(allocated_stock, 2),
        "net_inventory_position": net_position,
        "on_hand_runway_days": on_hand_runway_days,
        "net_runway_days": net_runway_days,
        "inventory_status": status,
        "recommended_action": action,
        "suggested_order_quantity_units": suggested_order_qty,
        "safety_stock_target_units": ss_units,
        "reorder_point_units": rop_units,
        "economic_order_quantity_units": eoq_units,
        "lead_time_days": lead_time_days,
    }

