"""
Commodity Scenario Stress Testing & Sensitivity Engine
Pure, deterministic mathematical stress testing for currency (USD/INR), ocean/inland freight,
customs duty tariffs, and ag weather yield shocks.

All functions are side-effect free, fully typed, and return clear dictionaries.
"""

from typing import Dict, Any, List, Optional, Literal
from .landed_cost import calculate_domestic_landed_cost, calculate_international_landed_cost

WeatherSeverity = Literal["BENIGN", "MILD_MOISTURE_EXCESS", "MODERATE_DROUGHT", "SEVERE_DROUGHT_FAILURE"]

WEATHER_SHOCK_MULTIPLIERS = {
    "BENIGN": 1.00,                      # Normal season, 0% shock
    "MILD_MOISTURE_EXCESS": 1.035,        # Harvest damage / quality discount (+3.5% price)
    "MODERATE_DROUGHT": 1.090,            # 10-15% crop reduction (+9.0% price)
    "SEVERE_DROUGHT_FAILURE": 1.200,      # Major crop deficit (+20.0% price)
}


def stress_test_procurement_scenarios(
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
    Simulates single-factor and combined multi-factor macro stress shocks across import parity
    and domestic agricultural procurement.

    Args:
        base_fob_usd_per_mt: Baseline FOB price in USD per MT
        base_ocean_freight_usd_per_mt: Baseline ocean freight in USD/MT
        base_exchange_rate_usd_to_inr: Baseline USD to INR exchange rate
        base_customs_duty_rate: Baseline Basic Customs Duty rate fraction (e.g. 0.05 for 5%)
        base_domestic_price_per_mt: Baseline domestic farmgate/mandi price in INR/MT
        base_domestic_freight_per_mt: Baseline domestic inland freight in INR/MT
        inr_depreciation_pct: Percentage depreciation in INR (e.g. 5.0 for 5% weaker rupee)
        ocean_freight_shock_pct: Percentage spike in shipping freight (e.g. 30.0 for 30% rise)
        customs_duty_hike_pct_points: Absolute percentage point tariff hike (e.g. 5.0 for +5% BCD)
        weather_impact: Agronomic weather anomaly severity
        domestic_fuel_hike_pct: Percentage increase in domestic trucking freight

    Returns:
        Comprehensive dictionary detailing baseline landed costs, isolated sensitivities,
        combined black swan scenario, and import/domestic parity comparison.
    """
    if base_fob_usd_per_mt <= 0 or base_exchange_rate_usd_to_inr <= 0 or base_domestic_price_per_mt <= 0:
        raise ValueError("Baseline prices and exchange rates must be positive")
    if weather_impact not in WEATHER_SHOCK_MULTIPLIERS:
        raise ValueError(f"Invalid weather_impact: {weather_impact}")

    # 1. Baseline Calculations
    base_intl = calculate_international_landed_cost(
        fob_price_usd_per_mt=base_fob_usd_per_mt,
        ocean_freight_usd_per_mt=base_ocean_freight_usd_per_mt,
        exchange_rate_usd_to_inr=base_exchange_rate_usd_to_inr,
        basic_customs_duty_rate=base_customs_duty_rate,
        inland_transport_inr_per_mt=base_domestic_freight_per_mt,
    )
    base_intl_landed = base_intl["totals"]["total_landed_cost_inr_per_mt"]

    base_dom = calculate_domestic_landed_cost(
        base_price_per_unit=base_domestic_price_per_mt,
        freight_per_unit=base_domestic_freight_per_mt,
    )
    base_dom_landed = base_dom["total_landed_cost_per_unit"]

    # 2. Sensitivity 1: Currency Shock (INR Depreciation)
    stressed_fx = base_exchange_rate_usd_to_inr * (1.0 + inr_depreciation_pct / 100.0)
    fx_shock_intl = calculate_international_landed_cost(
        fob_price_usd_per_mt=base_fob_usd_per_mt,
        ocean_freight_usd_per_mt=base_ocean_freight_usd_per_mt,
        exchange_rate_usd_to_inr=stressed_fx,
        basic_customs_duty_rate=base_customs_duty_rate,
        inland_transport_inr_per_mt=base_domestic_freight_per_mt,
    )["totals"]["total_landed_cost_inr_per_mt"]

    # 3. Sensitivity 2: Ocean Freight Spike
    stressed_ocean_freight = base_ocean_freight_usd_per_mt * (1.0 + ocean_freight_shock_pct / 100.0)
    freight_shock_intl = calculate_international_landed_cost(
        fob_price_usd_per_mt=base_fob_usd_per_mt,
        ocean_freight_usd_per_mt=stressed_ocean_freight,
        exchange_rate_usd_to_inr=base_exchange_rate_usd_to_inr,
        basic_customs_duty_rate=base_customs_duty_rate,
        inland_transport_inr_per_mt=base_domestic_freight_per_mt,
    )["totals"]["total_landed_cost_inr_per_mt"]

    # 4. Sensitivity 3: Customs Duty Tariff Hike
    stressed_duty_rate = base_customs_duty_rate + (customs_duty_hike_pct_points / 100.0)
    duty_shock_intl = calculate_international_landed_cost(
        fob_price_usd_per_mt=base_fob_usd_per_mt,
        ocean_freight_usd_per_mt=base_ocean_freight_usd_per_mt,
        exchange_rate_usd_to_inr=base_exchange_rate_usd_to_inr,
        basic_customs_duty_rate=stressed_duty_rate,
        inland_transport_inr_per_mt=base_domestic_freight_per_mt,
    )["totals"]["total_landed_cost_inr_per_mt"]

    # 5. Sensitivity 4: Domestic Weather Shock
    weather_multiplier = WEATHER_SHOCK_MULTIPLIERS[weather_impact]
    stressed_domestic_price = base_domestic_price_per_mt * weather_multiplier
    stressed_domestic_freight = base_domestic_freight_per_mt * (1.0 + domestic_fuel_hike_pct / 100.0)
    weather_shock_dom = calculate_domestic_landed_cost(
        base_price_per_unit=stressed_domestic_price,
        freight_per_unit=stressed_domestic_freight,
    )["total_landed_cost_per_unit"]

    # 6. Combined Multi-Factor Disaster Scenario (All Shocks Compounded)
    combined_intl = calculate_international_landed_cost(
        fob_price_usd_per_mt=base_fob_usd_per_mt,
        ocean_freight_usd_per_mt=stressed_ocean_freight,
        exchange_rate_usd_to_inr=stressed_fx,
        basic_customs_duty_rate=stressed_duty_rate,
        inland_transport_inr_per_mt=stressed_domestic_freight,
    )["totals"]["total_landed_cost_inr_per_mt"]

    combined_dom = weather_shock_dom

    # 7. Breakeven Exchange Rate Analysis
    # Point at which international landed cost exactly equals domestic landed cost
    cif_usd = base_fob_usd_per_mt + base_ocean_freight_usd_per_mt
    # Approx multiplier for duty, port, transport
    customs_mult = 1.0 + (base_customs_duty_rate * 1.1)  # Duty + SWS
    net_domestic_available = base_dom_landed - (base_domestic_freight_per_mt + 1100.0)
    breakeven_fx = round(net_domestic_available / (cif_usd * customs_mult), 2) if cif_usd > 0 else 0.0

    return {
        "baseline_summary": {
            "international_landed_cost_inr_per_mt": base_intl_landed,
            "domestic_landed_cost_inr_per_mt": base_dom_landed,
            "import_parity_spread_inr_per_mt": round(base_intl_landed - base_dom_landed, 2),
            "cost_effective_channel": "DOMESTIC" if base_dom_landed < base_intl_landed else "INTERNATIONAL_IMPORT",
            "breakeven_usd_inr_rate": breakeven_fx,
        },
        "isolated_stress_sensitivities": {
            "currency_shock": {
                "inr_depreciation_pct": inr_depreciation_pct,
                "stressed_exchange_rate": round(stressed_fx, 2),
                "stressed_landed_cost_inr_per_mt": fx_shock_intl,
                "delta_inr_per_mt": round(fx_shock_intl - base_intl_landed, 2),
                "delta_pct": round(((fx_shock_intl - base_intl_landed) / base_intl_landed) * 100.0, 2),
            },
            "ocean_freight_shock": {
                "ocean_freight_shock_pct": ocean_freight_shock_pct,
                "stressed_freight_usd": round(stressed_ocean_freight, 2),
                "stressed_landed_cost_inr_per_mt": freight_shock_intl,
                "delta_inr_per_mt": round(freight_shock_intl - base_intl_landed, 2),
                "delta_pct": round(((freight_shock_intl - base_intl_landed) / base_intl_landed) * 100.0, 2),
            },
            "customs_duty_hike": {
                "customs_duty_hike_pct_points": customs_duty_hike_pct_points,
                "stressed_duty_rate_pct": round(stressed_duty_rate * 100.0, 2),
                "stressed_landed_cost_inr_per_mt": duty_shock_intl,
                "delta_inr_per_mt": round(duty_shock_intl - base_intl_landed, 2),
                "delta_pct": round(((duty_shock_intl - base_intl_landed) / base_intl_landed) * 100.0, 2),
            },
            "domestic_weather_shock": {
                "weather_scenario": weather_impact,
                "domestic_price_multiplier": weather_multiplier,
                "stressed_domestic_price_inr": round(stressed_domestic_price, 2),
                "stressed_landed_cost_inr_per_mt": weather_shock_dom,
                "delta_inr_per_mt": round(weather_shock_dom - base_dom_landed, 2),
                "delta_pct": round(((weather_shock_dom - base_dom_landed) / base_dom_landed) * 100.0, 2),
            },
        },
        "combined_stress_scenario": {
            "description": "Simultaneous Rupee Depreciation + Ocean Freight Surge + Tariff Hike + Weather Shock",
            "stressed_international_landed_cost_inr": combined_intl,
            "international_cost_inflation_pct": round(
                ((combined_intl - base_intl_landed) / base_intl_landed) * 100.0, 2
            ),
            "stressed_domestic_landed_cost_inr": combined_dom,
            "domestic_cost_inflation_pct": round(
                ((combined_dom - base_dom_landed) / base_dom_landed) * 100.0, 2
            ),
            "stressed_import_parity_spread_inr": round(combined_intl - combined_dom, 2),
            "cost_effective_channel_under_stress": (
                "DOMESTIC" if combined_dom < combined_intl else "INTERNATIONAL_IMPORT"
            ),
        },
    }

