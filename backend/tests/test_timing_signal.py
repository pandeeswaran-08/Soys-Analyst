"""
Unit tests for backend/math_core/timing_signal.py
Audited tests verifying Buy, Wait, and Monitor decision rules and quantitative thresholds.
"""

import pytest
from backend.math_core.timing_signal import generate_timing_signal


class TestTimingSignal:
    def test_buy_mandatory_on_depleted_stock(self):
        """When stock is at or below critical threshold, BUY_MANDATORY must trigger regardless of price."""
        res = generate_timing_signal(
            current_price=5200.0,
            forecasted_prices=[5150.0, 5100.0, 5050.0],  # Even though price is dropping
            target_cost_budget=5000.0,                   # and current price is above budget
            current_stock_days=5.0,                      # Stock is below critical threshold of 7.0
            critical_stock_threshold_days=7.0,
        )

        assert res["signal"] == "BUY_MANDATORY"
        assert res["action"] == "PROCURE_IMMEDIATELY_FULL"
        assert res["urgency_level"] == "CRITICAL"
        assert res["recommended_order_fraction"] == 1.0

    def test_wait_price_drop_when_price_declines_and_stock_adequate(self):
        """When forecast expects price drop and stock runway is comfortable, WAIT_PRICE_DROP must trigger."""
        res = generate_timing_signal(
            current_price=5000.0,
            forecasted_prices=[4900.0, 4800.0, 4750.0, 4700.0],  # ~-4% to -6% decline
            target_cost_budget=5000.0,
            current_stock_days=35.0,                             # 35 days stock > 20 days ROP
            reorder_threshold_days=20.0,
            price_drop_significance_pct=2.0,
        )

        assert res["signal"] == "WAIT_PRICE_DROP"
        assert res["action"] == "DEFER_PROCUREMENT"
        assert res["urgency_level"] == "LOW"
        assert res["recommended_order_fraction"] == 0.0
        assert res["forecast_analysis"]["expected_price_change_pct"] < -2.0

    def test_buy_aggressive_on_cost_advantage_and_expected_rally(self):
        """When price is below budget and expected to surge, BUY_AGGRESSIVE must trigger."""
        res = generate_timing_signal(
            current_price=4600.0,                                # Budget is 5000 (+8% advantage)
            forecasted_prices=[4750.0, 4850.0, 4950.0, 5100.0],  # +6% to +10% expected rally
            target_cost_budget=5000.0,
            current_stock_days=22.0,
            price_rally_significance_pct=2.5,
        )

        assert res["signal"] == "BUY_AGGRESSIVE"
        assert res["action"] == "PROCURE_FULL_ALLOCATION"
        assert res["urgency_level"] == "HIGH"
        assert res["recommended_order_fraction"] == 1.0
        assert res["pricing_analysis"]["cost_advantage_pct"] > 5.0
        assert res["holding_cost_arbitrage"]["is_arbitrage_profitable"] is True

    def test_buy_scale_in_when_approaching_reorder_point(self):
        """When stock is near or below reorder threshold, BUY_SCALE_IN must trigger."""
        res = generate_timing_signal(
            current_price=5000.0,
            forecasted_prices=[5020.0, 5010.0, 5030.0],  # Flat price
            target_cost_budget=5000.0,
            current_stock_days=18.0,                    # Approaching 20 days threshold
            reorder_threshold_days=20.0,
            critical_stock_threshold_days=7.0,
        )

        assert res["signal"] == "BUY_SCALE_IN"
        assert res["action"] == "PROCURE_TRANCHE"
        assert res["recommended_order_fraction"] == 0.5
        assert res["urgency_level"] == "MEDIUM"

    def test_monitor_neutral_when_range_bound_and_healthy_stock(self):
        """When market is stable and inventory is healthy, MONITOR_NEUTRAL must trigger."""
        res = generate_timing_signal(
            current_price=5000.0,
            forecasted_prices=[5005.0, 4995.0, 5010.0, 5000.0],  # Fluctuations < 0.2%
            target_cost_budget=4950.0,
            current_stock_days=30.0,                             # Healthy runway
            reorder_threshold_days=20.0,
        )

        assert res["signal"] == "MONITOR_NEUTRAL"
        assert res["action"] == "MAINTAIN_MONITORING"
        assert res["recommended_order_fraction"] == 0.0

    def test_invalid_arguments(self):
        with pytest.raises(ValueError, match="current_price"):
            generate_timing_signal(current_price=-10.0, forecasted_prices=[100.0], target_cost_budget=100.0, current_stock_days=10.0)

        with pytest.raises(ValueError, match="forecasted_prices"):
            generate_timing_signal(current_price=100.0, forecasted_prices=[], target_cost_budget=100.0, current_stock_days=10.0)

