"""
Unit tests for backend/math_core/scenario.py
Audited tests verifying macro stress testing across INR depreciation, ocean freight, customs tariffs, and weather shocks.
"""

import pytest
from backend.math_core.scenario import (
    stress_test_procurement_scenarios,
    WEATHER_SHOCK_MULTIPLIERS,
)


class TestScenarioStressTesting:
    def test_baseline_and_sensitivities(self):
        """Verifies baseline calculations and isolated shock sensitivities."""
        res = stress_test_procurement_scenarios(
            base_fob_usd_per_mt=950.0,
            base_ocean_freight_usd_per_mt=50.0,
            base_exchange_rate_usd_to_inr=85.0,
            base_customs_duty_rate=0.05,
            base_domestic_price_per_mt=48000.0,
            base_domestic_freight_per_mt=1500.0,
            inr_depreciation_pct=5.0,
            ocean_freight_shock_pct=30.0,
            customs_duty_hike_pct_points=5.0,
            weather_impact="MODERATE_DROUGHT",
        )

        base_intl = res["baseline_summary"]["international_landed_cost_inr_per_mt"]
        base_dom = res["baseline_summary"]["domestic_landed_cost_inr_per_mt"]
        sensitivities = res["isolated_stress_sensitivities"]

        # 1. Currency shock (+5% INR depreciation increases international landed cost)
        fx_shock = sensitivities["currency_shock"]
        assert fx_shock["stressed_landed_cost_inr_per_mt"] > base_intl
        assert fx_shock["delta_inr_per_mt"] > 0
        assert abs(fx_shock["stressed_exchange_rate"] - (85.0 * 1.05)) < 1e-2

        # 2. Ocean freight shock (+30% freight increases landed cost)
        freight_shock = sensitivities["ocean_freight_shock"]
        assert freight_shock["stressed_landed_cost_inr_per_mt"] > base_intl
        assert freight_shock["delta_inr_per_mt"] > 0
        assert freight_shock["stressed_freight_usd"] == 65.0  # 50 * 1.30

        # 3. Customs tariff hike (+500 bps duty increases landed cost)
        duty_shock = sensitivities["customs_duty_hike"]
        assert duty_shock["stressed_landed_cost_inr_per_mt"] > base_intl
        assert duty_shock["stressed_duty_rate_pct"] == 10.0  # 5% + 5%

        # 4. Weather shock (Moderate drought increases domestic mandi price)
        weather_shock = sensitivities["domestic_weather_shock"]
        assert weather_shock["stressed_landed_cost_inr_per_mt"] > base_dom
        assert weather_shock["domestic_price_multiplier"] == WEATHER_SHOCK_MULTIPLIERS["MODERATE_DROUGHT"]

    def test_combined_macro_disaster_scenario(self):
        """Combined compounding shock scenario must produce the highest landed costs."""
        res = stress_test_procurement_scenarios(
            base_fob_usd_per_mt=950.0,
            base_ocean_freight_usd_per_mt=50.0,
            base_exchange_rate_usd_to_inr=85.0,
            inr_depreciation_pct=10.0,
            ocean_freight_shock_pct=50.0,
            customs_duty_hike_pct_points=5.0,
            weather_impact="SEVERE_DROUGHT_FAILURE",
        )

        base_intl = res["baseline_summary"]["international_landed_cost_inr_per_mt"]
        base_dom = res["baseline_summary"]["domestic_landed_cost_inr_per_mt"]
        combined = res["combined_stress_scenario"]

        assert combined["stressed_international_landed_cost_inr"] > base_intl
        assert combined["stressed_domestic_landed_cost_inr"] > base_dom
        assert combined["international_cost_inflation_pct"] > 10.0
        assert combined["domestic_cost_inflation_pct"] > 15.0

    def test_weather_multipliers_monotonicity(self):
        """Severe drought must produce higher domestic landed cost than mild or benign."""
        res_benign = stress_test_procurement_scenarios(weather_impact="BENIGN")
        res_moderate = stress_test_procurement_scenarios(weather_impact="MODERATE_DROUGHT")
        res_severe = stress_test_procurement_scenarios(weather_impact="SEVERE_DROUGHT_FAILURE")

        cost_benign = res_benign["isolated_stress_sensitivities"]["domestic_weather_shock"]["stressed_landed_cost_inr_per_mt"]
        cost_moderate = res_moderate["isolated_stress_sensitivities"]["domestic_weather_shock"]["stressed_landed_cost_inr_per_mt"]
        cost_severe = res_severe["isolated_stress_sensitivities"]["domestic_weather_shock"]["stressed_landed_cost_inr_per_mt"]

        assert cost_severe > cost_moderate > cost_benign

    def test_invalid_parameters(self):
        with pytest.raises(ValueError, match="Baseline prices"):
            stress_test_procurement_scenarios(base_fob_usd_per_mt=-10.0)

        with pytest.raises(ValueError, match="Invalid weather_impact"):
            stress_test_procurement_scenarios(weather_impact="TSUNAMI_FLOOD")  # type: ignore

