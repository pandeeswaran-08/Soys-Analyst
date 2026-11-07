"""
LangChain / LangGraph Mathematical Tools
Exposes every deterministic math_core formula as an agent tool.
Guarantees that no LLM computes mathematical numbers internally;
agents invoke these audited numerical routines directly.
"""

from typing import List, Dict, Any, Optional, Literal
from langchain_core.tools import tool

try:
    from backend.math_core.landed_cost import (
        calculate_domestic_landed_cost,
        calculate_international_landed_cost,
    )
    from backend.math_core.forecasting import (
        holt_winters_forecast,
        auto_holt_winters,
    )
    from backend.math_core.inventory import (
        calculate_safety_stock,
        calculate_reorder_point,
        calculate_economic_order_quantity,
        evaluate_inventory_position,
    )
    from backend.math_core.timing_signal import (
        generate_timing_signal,
    )
    from backend.math_core.scenario import (
        stress_test_procurement_scenarios,
        WeatherSeverity,
    )
except ImportError:
    from math_core.landed_cost import (
        calculate_domestic_landed_cost,
        calculate_international_landed_cost,
    )
    from math_core.forecasting import (
        holt_winters_forecast,
        auto_holt_winters,
    )
    from math_core.inventory import (
        calculate_safety_stock,
        calculate_reorder_point,
        calculate_economic_order_quantity,
        evaluate_inventory_position,
    )
    from math_core.timing_signal import (
        generate_timing_signal,
    )
    from math_core.scenario import (
        stress_test_procurement_scenarios,
        WeatherSeverity,
    )


@tool
def calculate_domestic_landed_cost_tool(
    base_price_per_unit: float,
    freight_per_unit: float,
    handling_per_unit: float = 0.0,
    mandi_tax_rate: float = 0.015,
    transit_insurance_rate: float = 0.001,
    in_transit_shrinkage_rate: float = 0.003,
    unloading_storage_per_unit: float = 0.0,
    gst_rate: float = 0.05,
    itc_eligible: bool = True,
    brokerage_commission_per_unit: float = 0.0,
) -> Dict[str, Any]:
    """
    Computes total landed procurement cost per unit for domestic commodity purchases (e.g., Mandi/Farmgate to Plant).
    Returns complete breakdown: base material, mandi tax, freight, handling, shrinkage, transit insurance, GST, and percentages.
    """
    return calculate_domestic_landed_cost(
        base_price_per_unit=base_price_per_unit,
        freight_per_unit=freight_per_unit,
        handling_per_unit=handling_per_unit,
        mandi_tax_rate=mandi_tax_rate,
        transit_insurance_rate=transit_insurance_rate,
        in_transit_shrinkage_rate=in_transit_shrinkage_rate,
        unloading_storage_per_unit=unloading_storage_per_unit,
        gst_rate=gst_rate,
        itc_eligible=itc_eligible,
        brokerage_commission_per_unit=brokerage_commission_per_unit,
    )


@tool
def calculate_international_landed_cost_tool(
    fob_price_usd_per_mt: float,
    ocean_freight_usd_per_mt: float,
    marine_insurance_rate: float = 0.0015,
    exchange_rate_usd_to_inr: float = 85.0,
    basic_customs_duty_rate: float = 0.05,
    agriculture_infrastructure_cess_rate: float = 0.05,
    social_welfare_surcharge_rate: float = 0.10,
    integrated_gst_rate: float = 0.05,
    itc_eligible_gst: bool = True,
    port_handling_and_wharfage_inr_per_mt: float = 850.0,
    customs_cha_charges_inr_per_mt: float = 250.0,
    inland_transport_inr_per_mt: float = 1800.0,
    voyage_shrinkage_loss_rate: float = 0.003,
    trade_finance_cost_rate: float = 0.012,
    other_port_cess_inr_per_mt: float = 50.0,
) -> Dict[str, Any]:
    """
    Computes international import parity landed cost for commodity shipments into destination ports.
    Returns complete breakdown: CIF USD, Assessable Value INR, BCD, AIDC, SWS, IGST, port handling, CHA, inland transport, and trade finance.
    """
    return calculate_international_landed_cost(
        fob_price_usd_per_mt=fob_price_usd_per_mt,
        ocean_freight_usd_per_mt=ocean_freight_usd_per_mt,
        marine_insurance_rate=marine_insurance_rate,
        exchange_rate_usd_to_inr=exchange_rate_usd_to_inr,
        basic_customs_duty_rate=basic_customs_duty_rate,
        agriculture_infrastructure_cess_rate=agriculture_infrastructure_cess_rate,
        social_welfare_surcharge_rate=social_welfare_surcharge_rate,
        integrated_gst_rate=integrated_gst_rate,
        itc_eligible_gst=itc_eligible_gst,
        port_handling_and_wharfage_inr_per_mt=port_handling_and_wharfage_inr_per_mt,
        customs_cha_charges_inr_per_mt=customs_cha_charges_inr_per_mt,
        inland_transport_inr_per_mt=inland_transport_inr_per_mt,
        voyage_shrinkage_loss_rate=voyage_shrinkage_loss_rate,
        trade_finance_cost_rate=trade_finance_cost_rate,
        other_port_cess_inr_per_mt=other_port_cess_inr_per_mt,
    )


@tool
def forecast_price_tool(
    series: List[float],
    forecast_steps: int = 14,
    seasonal_periods: int = 7,
    trend: Literal["add", "mul", None] = "add",
    seasonal: Literal["add", "mul", None] = "add",
    confidence_level: float = 0.95,
    damped_trend: bool = False,
) -> Dict[str, Any]:
    """
    Fits a Holt-Winters Exponential Smoothing model using statsmodels and forecasts forward prices
    with upper and lower statistical uncertainty bands, MAE, RMSE, MAPE, and AIC.
    """
    return holt_winters_forecast(
        series=series,
        forecast_steps=forecast_steps,
        seasonal_periods=seasonal_periods,
        trend=trend,
        seasonal=seasonal,
        confidence_level=confidence_level,
        damped_trend=damped_trend,
    )


@tool
def auto_forecast_price_tool(
    series: List[float],
    forecast_steps: int = 14,
    seasonal_periods: int = 7,
    confidence_level: float = 0.95,
) -> Dict[str, Any]:
    """
    Automatically benchmarks additive and multiplicative Holt-Winters models, compares in-sample RMSE,
    and returns the statistically optimal forecast with uncertainty bands.
    """
    return auto_holt_winters(
        series=series,
        forecast_steps=forecast_steps,
        seasonal_periods=seasonal_periods,
        confidence_level=confidence_level,
    )


@tool
def calculate_safety_stock_tool(
    average_daily_demand: float,
    demand_std_dev: float,
    lead_time_days: float,
    lead_time_std_dev: float = 0.0,
    service_level: float = 0.95,
) -> Dict[str, Any]:
    """
    Computes statistical safety stock protecting against demand and supplier delivery lead-time variability.
    Formula: SS = Z * sqrt( (L * sigma_D^2) + (D_avg^2 * sigma_L^2) ).
    Returns safety stock units, buffer days, Z-score, and variance breakdown.
    """
    return calculate_safety_stock(
        average_daily_demand=average_daily_demand,
        demand_std_dev=demand_std_dev,
        lead_time_days=lead_time_days,
        lead_time_std_dev=lead_time_std_dev,
        service_level=service_level,
    )


@tool
def calculate_reorder_point_tool(
    average_daily_demand: float,
    lead_time_days: float,
    safety_stock_units: float,
) -> Dict[str, Any]:
    """
    Computes the inventory Reorder Point (ROP).
    Formula: ROP = (Average Daily Demand * Average Lead Time) + Safety Stock.
    """
    return calculate_reorder_point(
        average_daily_demand=average_daily_demand,
        lead_time_days=lead_time_days,
        safety_stock_units=safety_stock_units,
    )


@tool
def calculate_economic_order_quantity_tool(
    annual_demand_units: float,
    fixed_order_cost: float,
    annual_holding_cost_per_unit: float,
    unit_purchase_cost: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Calculates Economic Order Quantity (EOQ), orders per year, cycle days, and annual holding and ordering costs.
    Formula: EOQ = sqrt( (2 * D * S) / H ).
    """
    return calculate_economic_order_quantity(
        annual_demand_units=annual_demand_units,
        fixed_order_cost=fixed_order_cost,
        annual_holding_cost_per_unit=annual_holding_cost_per_unit,
        unit_purchase_cost=unit_purchase_cost,
    )


@tool
def evaluate_inventory_position_tool(
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
    Assesses full inventory position health and returns status ('CRITICAL_STOCKOUT_RISK', 'REORDER_NOW', 'HEALTHY', 'OVERSTOCKED'),
    stock runway days, and suggested order lot size.
    """
    return evaluate_inventory_position(
        current_stock_on_hand=current_stock_on_hand,
        stock_in_transit=stock_in_transit,
        allocated_stock=allocated_stock,
        average_daily_demand=average_daily_demand,
        lead_time_days=lead_time_days,
        demand_std_dev=demand_std_dev,
        lead_time_std_dev=lead_time_std_dev,
        service_level=service_level,
        fixed_order_cost=fixed_order_cost,
        annual_holding_cost_per_unit=annual_holding_cost_per_unit,
    )


@tool
def generate_timing_signal_tool(
    current_price: float,
    forecasted_prices: List[float],
    target_cost_budget: float,
    current_stock_days: float,
    reorder_threshold_days: float = 20.0,
    critical_stock_threshold_days: float = 7.0,
    daily_carrying_cost_rate: float = 0.0004,
    forecast_confidence: float = 0.90,
    price_drop_significance_pct: float = 2.0,
    price_rally_significance_pct: float = 2.5,
) -> Dict[str, Any]:
    """
    Generates quantitative procurement timing recommendations ('BUY_AGGRESSIVE', 'BUY_SCALE_IN', 'WAIT_PRICE_DROP', 'MONITOR_NEUTRAL', 'BUY_MANDATORY')
    based on forward price forecasts, budget cost advantages, carrying costs, and stock runway days.
    """
    return generate_timing_signal(
        current_price=current_price,
        forecasted_prices=forecasted_prices,
        target_cost_budget=target_cost_budget,
        current_stock_days=current_stock_days,
        reorder_threshold_days=reorder_threshold_days,
        critical_stock_threshold_days=critical_stock_threshold_days,
        daily_carrying_cost_rate=daily_carrying_cost_rate,
        forecast_confidence=forecast_confidence,
        price_drop_significance_pct=price_drop_significance_pct,
        price_rally_significance_pct=price_rally_significance_pct,
    )


@tool
def stress_test_procurement_tool(
    base_fob_usd_per_mt: float = 980.0,
    base_ocean_freight_usd_per_mt: float = 55.0,
    base_exchange_rate_usd_to_inr: float = 85.0,
    base_customs_duty_rate: float = 0.05,
    base_domestic_price_per_mt: float = 48500.0,
    base_domestic_freight_per_mt: float = 1800.0,
    inr_depreciation_pct: float = 5.0,
    ocean_freight_shock_pct: float = 30.0,
    customs_duty_hike_pct_points: float = 5.0,
    weather_impact: WeatherSeverity = "MODERATE_DROUGHT",
    domestic_fuel_hike_pct: float = 10.0,
) -> Dict[str, Any]:
    """
    Executes macro stress testing on commodity procurement across currency shocks, shipping rate surges, tariff hikes, and domestic drought anomalies.
    Returns baseline comparison, isolated sensitivities, compound black swan impact, and breakeven USD/INR exchange rate.
    """
    return stress_test_procurement_scenarios(
        base_fob_usd_per_mt=base_fob_usd_per_mt,
        base_ocean_freight_usd_per_mt=base_ocean_freight_usd_per_mt,
        base_exchange_rate_usd_to_inr=base_exchange_rate_usd_to_inr,
        base_customs_duty_rate=base_customs_duty_rate,
        base_domestic_price_per_mt=base_domestic_price_per_mt,
        base_domestic_freight_per_mt=base_domestic_freight_per_mt,
        inr_depreciation_pct=inr_depreciation_pct,
        ocean_freight_shock_pct=ocean_freight_shock_pct,
        customs_duty_hike_pct_points=customs_duty_hike_pct_points,
        weather_impact=weather_impact,
        domestic_fuel_hike_pct=domestic_fuel_hike_pct,
    )


ALL_MATH_CORE_TOOLS = [
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
]

