"""
Node 3: ToolRouter / Executor
Executes deterministic math_core tools and the Qdrant hybrid document retriever.
Builds an authoritative Ground Truth Number registry for the NumericalSafetyGuard.
"""

import logging
from typing import Dict, Any, List
from soy_agent.state import AgentState
from soy_agent.tools.math_core_tools import (
    calculate_domestic_landed_cost_tool,
    calculate_international_landed_cost_tool,
    forecast_price_tool,
    calculate_safety_stock_tool,
    calculate_reorder_point_tool,
    evaluate_inventory_position_tool,
    generate_timing_signal_tool,
    stress_test_procurement_tool,
)
from soy_agent.tools.vector_tools import qdrant_hybrid_search_tool

logger = logging.getLogger("soydecision-executor")


def tool_router_node(state: AgentState) -> AgentState:
    """Executes relevant math tools and document retrieval based on the formulated plan."""
    intent = state.get("intent", "COMPREHENSIVE_STRATEGY")
    query = state.get("query", "")
    params = state.get("extracted_params", {})
    trace = state.get("trace", [])
    trace.append(f"[ToolRouter] Routing tool execution for intent: {intent}")

    tool_traces: List[Dict[str, Any]] = state.get("tool_traces", [])
    tool_results: Dict[str, Any] = state.get("tool_results", {})
    ground_truth_numbers: Dict[str, float] = state.get("ground_truth_numbers", {})

    # 1. Execute Qdrant Hybrid Search (Dense + Sparse BM25)
    trace.append("[ToolRouter] Invoking Qdrant Hybrid Search retriever...")
    rag_results = qdrant_hybrid_search_tool.invoke({
        "query": query,
        "limit": 4,
        "alpha": 0.5,
    })
    state["retrieved_intel"] = rag_results
    tool_results["qdrant_hybrid_search"] = rag_results
    tool_traces.append({
        "tool": "qdrant_hybrid_search_tool",
        "input": {"query": query, "limit": 4, "alpha": 0.5},
        "output": f"Retrieved {len(rag_results)} document chunks with hybrid scoring."
    })
    for r in rag_results:
        trace.append(f"  - [{r.get('source')}] {r.get('title')} (Dense: {r.get('dense_score')}, Sparse: {r.get('sparse_score')}, Hybrid: {r.get('hybrid_score')})")

    # 2. Execute Math Core Tools
    # Domestic Landed Cost
    if intent in ["LANDED_COST_PARITY", "TIMING_SIGNAL", "SCENARIO_STRESS_TEST", "COMPREHENSIVE_STRATEGY"]:
        dom_base = params.get("domestic_price", 4900.0)
        dom_input = {
            "base_price_per_unit": dom_base,
            "freight_per_unit": 180.0,
            "handling_per_unit": 35.0,
            "mandi_tax_rate": 0.015,
            "transit_insurance_rate": 0.001,
            "in_transit_shrinkage_rate": 0.003,
            "unloading_storage_per_unit": 20.0,
            "gst_rate": 0.05,
            "itc_eligible": True,
            "brokerage_commission_per_unit": 10.0,
        }
        dom_res = calculate_domestic_landed_cost_tool.invoke(dom_input)
        tool_results["domestic_landed_cost"] = dom_res
        tool_traces.append({"tool": "calculate_domestic_landed_cost_tool", "input": dom_input, "output": dom_res})
        
        # Register ground truth numbers
        ground_truth_numbers["domestic_base_price"] = dom_res["base_price_per_unit"]
        ground_truth_numbers["domestic_total_landed_cost"] = dom_res["total_landed_cost_per_unit"]
        ground_truth_numbers["domestic_mandi_tax"] = dom_res.get("mandi_tax_amount", 73.5)
        ground_truth_numbers["domestic_freight"] = dom_res.get("freight_per_unit", 180.0)
        ground_truth_numbers["domestic_gst_amount"] = dom_res.get("gst_amount", 245.0)
        ground_truth_numbers["domestic_net_gst_cost"] = dom_res.get("uncredited_gst_amount", 0.0)
        trace.append(f"[ToolRouter] Domestic Landed Cost computed: INR {dom_res['total_landed_cost_per_unit']:.2f} / quintal")

    # International Landed Cost
    if intent in ["LANDED_COST_PARITY", "SCENARIO_STRESS_TEST", "COMPREHENSIVE_STRATEGY"]:
        intl_input = {
            "fob_price_usd_per_mt": params.get("fob_price_usd", 960.0),
            "ocean_freight_usd_per_mt": 52.0,
            "marine_insurance_rate": 0.0015,
            "exchange_rate_usd_to_inr": 85.50,
            "basic_customs_duty_rate": 0.05,
            "agriculture_infrastructure_cess_rate": 0.05,
            "social_welfare_surcharge_rate": 0.10,
            "integrated_gst_rate": 0.05,
            "itc_eligible_gst": True,
            "port_handling_and_wharfage_inr_per_mt": 850.0,
            "customs_cha_charges_inr_per_mt": 250.0,
            "inland_transport_inr_per_mt": 1800.0,
            "voyage_shrinkage_loss_rate": 0.003,
            "trade_finance_cost_rate": 0.012,
            "other_port_cess_inr_per_mt": 50.0,
        }
        intl_res = calculate_international_landed_cost_tool.invoke(intl_input)
        tool_results["international_landed_cost"] = intl_res
        tool_traces.append({"tool": "calculate_international_landed_cost_tool", "input": intl_input, "output": intl_res})

        ground_truth_numbers["international_fob_usd"] = intl_res["pricing_usd"]["fob_price_usd_per_mt"]
        ground_truth_numbers["international_cif_usd"] = intl_res["pricing_usd"]["cif_price_usd_per_mt"]
        ground_truth_numbers["international_landed_cost_per_mt"] = intl_res["totals"]["total_landed_cost_inr_per_mt"]
        ground_truth_numbers["international_landed_cost_per_quintal"] = intl_res["totals"]["total_landed_cost_inr_per_quintal"]
        ground_truth_numbers["exchange_rate"] = intl_res.get("exchange_rate_usd_to_inr", 85.50)
        trace.append(f"[ToolRouter] International Landed Cost computed: INR {intl_res['totals']['total_landed_cost_inr_per_quintal']:.2f} / quintal (INR {intl_res['totals']['total_landed_cost_inr_per_mt']:.2f}/MT)")

    # Price Forecasting
    if intent in ["PRICE_FORECAST", "TIMING_SIGNAL", "COMPREHENSIVE_STRATEGY"]:
        series = [4500.0, 4520.0, 4550.0, 4580.0, 4610.0, 4650.0, 4680.0,
                  4670.0, 4710.0, 4740.0, 4780.0, 4820.0, 4850.0, 4890.0,
                  4880.0, 4920.0, 4950.0, 4990.0, 5020.0, 5060.0, 5100.0]
        forecast_input = {
            "series": series,
            "forecast_steps": 7,
            "seasonal_periods": 7,
            "trend": "add",
            "seasonal": "add",
            "confidence_level": 0.95,
        }
        fc_res = forecast_price_tool.invoke(forecast_input)
        tool_results["price_forecast"] = fc_res
        tool_traces.append({"tool": "forecast_price_tool", "input": forecast_input, "output": fc_res})

        ground_truth_numbers["forecast_mean_t1"] = fc_res["forecast_mean"][0]
        ground_truth_numbers["forecast_mean_t7"] = fc_res["forecast_mean"][-1]
        ground_truth_numbers["forecast_lower_t7"] = fc_res["prediction_intervals"]["95%"]["lower"][-1]
        ground_truth_numbers["forecast_upper_t7"] = fc_res["prediction_intervals"]["95%"]["upper"][-1]
        ground_truth_numbers["forecast_mae"] = fc_res["metrics"]["mae"]
        ground_truth_numbers["forecast_mape"] = fc_res["metrics"]["mape"]
        trace.append(f"[ToolRouter] Holt-Winters 7-day forecast generated (t+1: {fc_res['forecast_mean'][0]:.1f}, t+7: {fc_res['forecast_mean'][-1]:.1f})")

    # Inventory & Safety Stock
    if intent in ["INVENTORY_SAFETY_STOCK", "TIMING_SIGNAL", "COMPREHENSIVE_STRATEGY"]:
        inv_eval_input = {
            "current_stock": params.get("current_stock", 360.0),
            "reorder_point": 393.52,
            "safety_stock": 43.52,
            "average_daily_demand": 50.0,
        }
        inv_res = evaluate_inventory_position_tool.invoke(inv_eval_input)
        tool_results["inventory_evaluation"] = inv_res
        tool_traces.append({"tool": "evaluate_inventory_position_tool", "input": inv_eval_input, "output": inv_res})

        ground_truth_numbers["current_stock"] = inv_res["current_stock"]
        ground_truth_numbers["safety_stock"] = inv_res["safety_stock"]
        ground_truth_numbers["reorder_point"] = inv_res["reorder_point"]
        ground_truth_numbers["stock_days_cover"] = inv_res["estimated_days_of_supply"]
        trace.append(f"[ToolRouter] Inventory Position Evaluated: {inv_res['status']} ({inv_res['estimated_days_of_supply']:.1f} days cover)")

    # Timing Signal
    if intent in ["TIMING_SIGNAL", "COMPREHENSIVE_STRATEGY"]:
        timing_input = {
            "current_price": ground_truth_numbers.get("domestic_total_landed_cost", 5084.7),
            "forecasted_prices": tool_results.get("price_forecast", {}).get("forecast_mean", [5130.0, 5170.0, 5210.0]),
            "target_cost_budget": 5200.0,
            "current_stock_days": ground_truth_numbers.get("stock_days_cover", 7.2),
            "reorder_threshold_days": 10.0,
            "critical_stock_threshold_days": 3.0,
        }
        timing_res = generate_timing_signal_tool.invoke(timing_input)
        tool_results["timing_signal"] = timing_res
        tool_traces.append({"tool": "generate_timing_signal_tool", "input": timing_input, "output": timing_res})

        ground_truth_numbers["timing_recommended_fraction"] = timing_res["recommended_order_fraction"]
        ground_truth_numbers["timing_holding_cost_annual_rate"] = timing_res["holding_cost_arbitrage"]["holding_cost_rate_annual"]
        trace.append(f"[ToolRouter] Timing Signal Generated: {timing_res['signal']} -> Action: {timing_res['action']} ({timing_res['urgency_level']} urgency)")

    # Scenario Stress Test
    if intent in ["SCENARIO_STRESS_TEST", "COMPREHENSIVE_STRATEGY"]:
        scenario_input = {
            "base_fob_usd_per_mt": params.get("fob_price_usd", 960.0),
            "base_ocean_freight_usd_per_mt": 52.0,
            "base_exchange_rate_usd_to_inr": 85.50,
            "base_customs_duty_rate": 0.05,
            "base_domestic_price_per_mt": ground_truth_numbers.get("domestic_base_price", 4900.0) * 10.0,
            "base_domestic_freight_per_mt": 1800.0,
            "inr_depreciation_pct": 5.0,
            "ocean_freight_shock_pct": 25.0,
            "customs_duty_hike_pct_points": 5.0,
            "weather_impact": "SEVERE_DROUGHT",
        }
        stress_res = stress_test_procurement_tool.invoke(scenario_input)
        tool_results["stress_test"] = stress_res
        tool_traces.append({"tool": "stress_test_procurement_tool", "input": scenario_input, "output": stress_res})

        combined = stress_res["scenarios"]["combined_macro_disaster"]
        ground_truth_numbers["stress_baseline_import"] = stress_res["baseline"]["import_landed_inr_per_quintal"]
        ground_truth_numbers["stress_combined_import"] = combined["import_landed_inr_per_quintal"]
        ground_truth_numbers["stress_combined_domestic"] = combined["domestic_landed_inr_per_quintal"]
        ground_truth_numbers["stress_import_increase_pct"] = combined["import_landed_increase_pct"]
        ground_truth_numbers["stress_domestic_increase_pct"] = combined["domestic_landed_increase_pct"]
        trace.append(f"[ToolRouter] Scenario Stress Test executed: Combined disaster drives import to INR {combined['import_landed_inr_per_quintal']:.2f}/qtl (+{combined['import_landed_increase_pct']:.1f}%)")

    state["tool_results"] = tool_results
    state["tool_traces"] = tool_traces
    state["ground_truth_numbers"] = ground_truth_numbers
    state["trace"] = trace
    return state
