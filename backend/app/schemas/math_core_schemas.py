"""
Pydantic v2 validation models for math_core API endpoints, tools, and caching.
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field


# =========================================================================
# 1. Landed Cost Schemas
# =========================================================================

class DomesticLandedCostInput(BaseModel):
    base_price_per_unit: float = Field(default=4850.0, description="Base farmgate or Mandi purchase price per unit (INR/quintal or INR/MT)")
    freight_per_unit: float = Field(default=180.0, description="Domestic road/rail freight cost per unit")
    handling_per_unit: float = Field(default=35.0, description="Handling, labor, loading, and weighbridge charges")
    mandi_tax_rate: float = Field(default=0.015, description="Mandi tax / APMC cess fraction (e.g. 0.015 for 1.5%)")
    transit_insurance_rate: float = Field(default=0.001, description="Transit insurance rate fraction (e.g. 0.001 for 0.1%)")
    in_transit_shrinkage_rate: float = Field(default=0.003, description="Moisture / shrinkage loss fraction (e.g. 0.003 for 0.3%)")
    unloading_storage_per_unit: float = Field(default=20.0, description="Plant unloading, assay, and gate handling")
    gst_rate: float = Field(default=0.05, description="GST rate fraction (e.g. 0.05 for 5%)")
    itc_eligible: bool = Field(default=True, description="True if GST input tax credit can be claimed")
    brokerage_commission_per_unit: float = Field(default=10.0, description="Brokerage fee per unit")


class InternationalLandedCostInput(BaseModel):
    fob_price_usd_per_mt: float = Field(default=980.0, description="FOB price in USD per Metric Ton (e.g. Paranaguá / Up River)")
    ocean_freight_usd_per_mt: float = Field(default=55.0, description="Ocean freight rate in USD/MT to destination port")
    marine_insurance_rate: float = Field(default=0.0015, description="Marine cargo insurance fraction of (FOB + Freight)")
    exchange_rate_usd_to_inr: float = Field(default=85.0, description="USD to INR currency exchange rate")
    basic_customs_duty_rate: float = Field(default=0.05, description="Basic Customs Duty (BCD) fraction (e.g. 0.05 for 5%)")
    agriculture_infrastructure_cess_rate: float = Field(default=0.05, description="AIDC fraction (e.g. 0.05 for 5%)")
    social_welfare_surcharge_rate: float = Field(default=0.10, description="SWS fraction on duties (e.g. 0.10 for 10%)")
    integrated_gst_rate: float = Field(default=0.05, description="Integrated GST (IGST) rate fraction")
    itc_eligible_gst: bool = Field(default=True, description="True if IGST is claimable as input tax credit")
    port_handling_and_wharfage_inr_per_mt: float = Field(default=850.0, description="Port handling and stevedoring in INR/MT")
    customs_cha_charges_inr_per_mt: float = Field(default=250.0, description="Customs clearing agent (CHA) fees in INR/MT")
    inland_transport_inr_per_mt: float = Field(default=1800.0, description="Port-to-plant haulage in INR/MT")
    voyage_shrinkage_loss_rate: float = Field(default=0.003, description="Voyage transit loss fraction")
    trade_finance_cost_rate: float = Field(default=0.012, description="LC opening and forex hedging cost fraction")
    other_port_cess_inr_per_mt: float = Field(default=50.0, description="Maritime board cess in INR/MT")


class LandedCostRequest(BaseModel):
    channel: Literal["DOMESTIC", "INTERNATIONAL"] = Field(default="DOMESTIC", description="Procurement route")
    domestic: Optional[DomesticLandedCostInput] = Field(default_factory=DomesticLandedCostInput)
    international: Optional[InternationalLandedCostInput] = None


# =========================================================================
# 2. Forecasting Schemas
# =========================================================================

class PriceForecastRequest(BaseModel):
    series: List[float] = Field(
        default=[4650.0, 4680.0, 4710.0, 4700.0, 4740.0, 4780.0, 4820.0,
                 4800.0, 4850.0, 4890.0, 4870.0, 4920.0, 4960.0, 5010.0,
                 4980.0, 5040.0, 5080.0, 5060.0, 5110.0, 5150.0, 5200.0],
        description="Historical commodity price observations (at least 4 points)"
    )
    forecast_steps: int = Field(default=14, description="Number of forward periods to project (h >= 1)")
    seasonal_periods: int = Field(default=7, description="Seasonality period cycle (e.g. 7 for weekly)")
    trend: Literal["add", "mul", None] = Field(default="add", description="Trend component")
    seasonal: Literal["add", "mul", None] = Field(default="add", description="Seasonal component")
    confidence_level: float = Field(default=0.95, description="Prediction interval confidence (e.g. 0.95 for 95%)")
    damped_trend: bool = Field(default=False, description="Whether to apply damped trend")
    auto_select: bool = Field(default=False, description="Automatically benchmark and select superior model")


# =========================================================================
# 3. Inventory Schemas
# =========================================================================

class SafetyStockRequest(BaseModel):
    average_daily_demand: float = Field(default=80.0, description="Average daily consumption demand in MT/day")
    demand_std_dev: float = Field(default=12.0, description="Daily demand standard deviation (sigma_D)")
    lead_time_days: float = Field(default=7.0, description="Average supplier lead time in days")
    lead_time_std_dev: float = Field(default=1.5, description="Lead time variability standard deviation in days")
    service_level: float = Field(default=0.95, description="Target cycle service level fraction (0.5 to 0.999)")


class ReorderPointRequest(BaseModel):
    average_daily_demand: float = Field(default=80.0, description="Average daily consumption demand")
    lead_time_days: float = Field(default=7.0, description="Average supplier lead time in days")
    safety_stock_units: float = Field(default=75.0, description="Safety stock buffer units")


class EOQRequest(BaseModel):
    annual_demand_units: float = Field(default=29200.0, description="Total annual consumption demand in MT")
    fixed_order_cost: float = Field(default=4500.0, description="Fixed administrative / logistics ordering cost per PO")
    annual_holding_cost_per_unit: float = Field(default=150.0, description="Carrying / warehousing cost per MT per year")
    unit_purchase_cost: Optional[float] = Field(default=48500.0, description="Unit acquisition cost in INR/MT")


class InventoryEvaluationRequest(BaseModel):
    current_stock_on_hand: float = Field(default=550.0, description="Physical inventory in warehouse (MT)")
    stock_in_transit: float = Field(default=120.0, description="Dispatched shipments on way (MT)")
    allocated_stock: float = Field(default=50.0, description="Stock earmarked for active production (MT)")
    average_daily_demand: float = Field(default=80.0, description="Daily demand (MT/day)")
    lead_time_days: float = Field(default=7.0, description="Supplier lead time in days")
    demand_std_dev: float = Field(default=12.0, description="Daily demand standard deviation")
    lead_time_std_dev: float = Field(default=1.5, description="Lead time standard deviation")
    service_level: float = Field(default=0.95, description="Target service level")
    fixed_order_cost: float = Field(default=4500.0, description="Ordering cost per PO")
    annual_holding_cost_per_unit: float = Field(default=150.0, description="Holding cost per unit per year")


# =========================================================================
# 4. Timing Signal Schemas
# =========================================================================

class TimingSignalRequest(BaseModel):
    current_price: float = Field(default=4850.0, description="Current spot / cash commodity market price")
    forecasted_prices: List[float] = Field(
        default=[4870.0, 4890.0, 4920.0, 4950.0, 4990.0, 5020.0, 5060.0],
        description="Forecasted prices over forward planning horizon"
    )
    target_cost_budget: float = Field(default=5000.0, description="Internal procurement budget ceiling or benchmark")
    current_stock_days: float = Field(default=18.0, description="Current inventory runway in days")
    reorder_threshold_days: float = Field(default=20.0, description="Standard reorder trigger threshold in days")
    critical_stock_threshold_days: float = Field(default=7.0, description="Safety stock emergency floor in days")
    daily_carrying_cost_rate: float = Field(default=0.0004, description="Daily inventory carrying cost fraction")
    forecast_confidence: float = Field(default=0.92, description="Confidence of the forecasting model")
    price_drop_significance_pct: float = Field(default=2.0, description="Expected drop % justifying procurement deferral")
    price_rally_significance_pct: float = Field(default=2.5, description="Expected rally % justifying aggressive buying")


# =========================================================================
# 5. Scenario Stress Test Schemas
# =========================================================================

class ScenarioStressTestRequest(BaseModel):
    base_fob_usd_per_mt: float = Field(default=980.0, description="Base FOB price in USD/MT")
    base_ocean_freight_usd_per_mt: float = Field(default=55.0, description="Base ocean freight in USD/MT")
    base_exchange_rate_usd_to_inr: float = Field(default=85.0, description="Base USD/INR currency exchange rate")
    base_customs_duty_rate: float = Field(default=0.05, description="Base Basic Customs Duty fraction")
    base_domestic_price_per_mt: float = Field(default=48500.0, description="Base domestic mandi/farmgate price in INR/MT")
    base_domestic_freight_per_mt: float = Field(default=1800.0, description="Base domestic trucking freight in INR/MT")
    inr_depreciation_pct: float = Field(default=5.0, description="Simulated percentage depreciation in INR")
    ocean_freight_shock_pct: float = Field(default=30.0, description="Simulated percentage spike in shipping freight")
    customs_duty_hike_pct_points: float = Field(default=5.0, description="Simulated tariff hike in percentage points")
    weather_impact: Literal["BENIGN", "MILD_MOISTURE_EXCESS", "MODERATE_DROUGHT", "SEVERE_DROUGHT_FAILURE"] = Field(
        default="MODERATE_DROUGHT", description="Agronomic weather anomaly severity"
    )
    domestic_fuel_hike_pct: float = Field(default=10.0, description="Simulated increase in domestic transport tariffs")


# =========================================================================
# 6. Documents & Chat Schemas
# =========================================================================

class DocumentUploadRequest(BaseModel):
    title: str = Field(default="Market Commentary", description="Document title")
    content: str = Field(description="Full text content of document or report")
    source: Optional[str] = Field(default="Manual Upload", description="Source of the document")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional custom metadata attributes")


class ChatRequest(BaseModel):
    message: str = Field(
        default="What is our current domestic landed cost and should we buy soybeans now given the 14-day price forecast?",
        description="Trader inquiry or decision request"
    )
    session_id: Optional[str] = Field(default="session-desk-01", description="Session identifier for multi-turn dialogues")
    model: Optional[str] = Field(default="gemini-2.5-flash", description="LLM provider/model: gemini-2.5-flash, claude-3-5-sonnet, or gpt-4o")
    stream: bool = Field(default=True, description="Whether to stream the agent response via SSE")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Operational context: stock, lead time, budget")


class ExportRequest(BaseModel):
    title: str = Field(default="Executive Procurement & Hedging Recommendation")
    domestic_price: float = Field(default=4900.0)
    domestic_landed_cost: float = Field(default=5238.64)
    import_landed_cost: float = Field(default=10043.78)
    signal: str = Field(default="BUY_AGGRESSIVE")
    action: str = Field(default="PROCURE_FULL_ALLOCATION")
    urgency: str = Field(default="HIGH")
    current_stock: float = Field(default=360.0)
    reorder_point: float = Field(default=393.52)
    safety_stock: float = Field(default=43.52)
    forecast_7d: float = Field(default=5210.0)
    summary: Optional[str] = Field(default=None)

