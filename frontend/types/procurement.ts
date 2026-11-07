export type TimingSignalType = "BUY_AGGRESSIVE" | "BUY_SCALE_IN" | "WAIT_PRICE_DROP" | "MONITOR_NEUTRAL" | "BUY_MANDATORY";

export interface DomesticLandedCost {
  channel: "DOMESTIC";
  base_price_per_unit: number;
  mandi_tax_amount: number;
  gross_material_cost: number;
  freight_per_unit: number;
  handling_per_unit: number;
  unloading_storage_per_unit: number;
  shrinkage_loss_amount: number;
  total_logistics_handling: number;
  transit_insurance_amount: number;
  brokerage_commission_per_unit: number;
  total_commercial_charges: number;
  gst_amount: number;
  itc_eligible: boolean;
  uncredited_gst_amount: number;
  total_landed_cost_per_unit: number;
  cost_breakdown_percentages: {
    material_share_pct: number;
    logistics_share_pct: number;
    commercial_fees_share_pct: number;
    taxes_and_cess_share_pct: number;
  };
  _cached?: boolean;
}

export interface InternationalLandedCost {
  channel: "INTERNATIONAL_IMPORT";
  pricing_usd: {
    fob_price_usd_per_mt: number;
    ocean_freight_usd_per_mt: number;
    marine_insurance_usd_per_mt: number;
    cif_price_usd_per_mt: number;
  };
  customs_breakdown_inr: {
    assessable_value_inr_per_mt: number;
    basic_customs_duty_bcd: number;
    agriculture_infrastructure_cess_aidc: number;
    social_welfare_surcharge_sws: number;
    total_customs_duty: number;
    effective_customs_duty_pct: number;
    igst_amount: number;
    itc_eligible_gst: boolean;
    uncredited_igst: number;
  };
  logistics_and_handling_inr: {
    port_handling_and_wharfage: number;
    customs_cha_charges: number;
    other_port_cess: number;
    voyage_shrinkage_loss: number;
    total_port_clearance: number;
    inland_transport_port_to_plant: number;
  };
  financing_charges_inr: {
    trade_finance_and_hedging: number;
    trade_finance_rate_pct: number;
  };
  totals: {
    total_landed_cost_inr_per_mt: number;
    total_landed_cost_inr_per_quintal: number;
    total_landed_cost_inr_per_kg: number;
    total_landed_cost_usd_per_mt: number;
  };
  cost_percentages: {
    cif_base_share_pct: number;
    duties_and_taxes_share_pct: number;
    port_and_inland_logistics_share_pct: number;
    finance_share_pct: number;
  };
  _cached?: boolean;
}

export interface ForecastPoint {
  step: number;
  mean: number;
  lower_80: number;
  upper_80: number;
  lower_95: number;
  upper_95: number;
}

export interface ForecastResult {
  model: string;
  trend: string;
  seasonal: string;
  forecast_steps: number;
  forecast_mean: number[];
  prediction_intervals: {
    "80%": { lower: number[]; upper: number[] };
    "95%": { lower: number[]; upper: number[] };
  };
  metrics: {
    mae: number;
    rmse: number;
    mape: number;
    aic: number;
    bic: number;
  };
  _cached?: boolean;
}

export interface InventoryEvaluation {
  current_stock: number;
  reorder_point: number;
  safety_stock: number;
  average_daily_demand: number;
  estimated_days_of_supply: number;
  stockout_risk_level: string;
  status: "CRITICAL_STOCKOUT_RISK" | "REORDER_NOW" | "HEALTHY";
  action_recommended: string;
  economic_order_quantity?: number;
  service_level_z?: number;
  _cached?: boolean;
}

export interface TimingSignalResult {
  signal: TimingSignalType;
  action: string;
  urgency_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  recommended_order_fraction: number;
  pricing_analysis: {
    current_price: number;
    target_budget: number;
    cost_advantage_amount: number;
    cost_advantage_pct: number;
  };
  forecast_analysis: {
    forecasted_average_price: number;
    expected_price_change_amount: number;
    expected_price_change_pct: number;
    trend_direction: string;
  };
  holding_cost_arbitrage: {
    daily_holding_cost_rate: number;
    holding_cost_rate_annual: number;
    net_arbitrage_gain_per_unit: number;
    is_arbitrage_positive: boolean;
  };
  inventory_context: {
    current_stock_days: number;
    reorder_threshold_days: number;
    critical_stock_threshold_days: number;
  };
  rationales: string[];
  _cached?: boolean;
}

export interface StressScenarioSummary {
  domestic_landed_inr_per_quintal: number;
  import_landed_inr_per_quintal: number;
  domestic_cost_advantage_inr: number;
  import_landed_increase_pct: number;
  domestic_landed_increase_pct: number;
  parity_winner: string;
}

export interface StressTestResult {
  baseline: {
    import_landed_inr_per_quintal: number;
    import_landed_inr_per_mt: number;
    domestic_landed_inr_per_quintal: number;
    domestic_cost_advantage_inr: number;
    cheapest_channel: string;
  };
  sensitivities: Record<string, StressScenarioSummary>;
  scenarios: {
    combined_macro_disaster: StressScenarioSummary;
    drought_alone?: StressScenarioSummary;
    fx_spike_alone?: StressScenarioSummary;
  };
  breakeven_usd_inr_exchange_rate: number;
  _cached?: boolean;
}

export interface DocumentEntry {
  document_id: string;
  title: string;
  source: string;
  chunks_indexed: number;
  created_at?: string;
  preview?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  inputs: Record<string, any>;
  output_summary: string;
  latency_ms: number;
  cached: boolean;
  safety_guard_status: "PASSED" | "RECALCULATED" | "BYPASSED";
}

