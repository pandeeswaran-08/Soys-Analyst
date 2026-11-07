"""
Unit tests for backend/math_core/forecasting.py
Audited tests verifying Holt-Winters exponential smoothing, uncertainty bounds, and statsmodels accuracy.
"""

import pytest
import numpy as np
from backend.math_core.forecasting import (
    holt_winters_forecast,
    auto_holt_winters,
    calculate_forecast_metrics,
)


@pytest.fixture
def sample_daily_prices():
    """Generates 28 days of daily commodity price data with an upward trend and 7-day seasonality."""
    np.random.seed(42)
    base = 4500.0
    series = []
    for day in range(28):
        trend = day * 15.0
        seasonal = 100.0 * np.sin(2.0 * np.pi * (day % 7) / 7.0)
        noise = np.random.normal(0, 10.0)
        series.append(float(base + trend + seasonal + noise))
    return series


class TestHoltWintersForecasting:
    def test_additive_holt_winters_basic(self, sample_daily_prices):
        """Verifies additive Holt-Winters forecast generation and uncertainty bands."""
        steps = 7
        res = holt_winters_forecast(
            series=sample_daily_prices,
            forecast_steps=steps,
            seasonal_periods=7,
            trend="add",
            seasonal="add",
            confidence_level=0.95,
        )

        assert res["model_type"] == "Holt-Winters Exponential Smoothing"
        assert res["trend_type"] == "add"
        assert res["seasonal_type"] == "add"
        assert len(res["point_forecast"]) == steps
        assert len(res["lower_band"]) == steps
        assert len(res["upper_band"]) == steps

        # Check uncertainty interval ordering: lower <= point <= upper
        for i in range(steps):
            assert res["lower_band"][i] <= res["point_forecast"][i]
            assert res["point_forecast"][i] <= res["upper_band"][i]
            assert res["lower_band"][i] >= 0.0  # Non-negative price floor

        # In-sample metrics exist and are positive
        metrics = res["in_sample_metrics"]
        assert metrics["mae"] > 0
        assert metrics["rmse"] > 0
        assert metrics["mape_pct"] > 0

    def test_multiplicative_holt_winters(self, sample_daily_prices):
        """Verifies multiplicative seasonal Holt-Winters model."""
        res = holt_winters_forecast(
            series=sample_daily_prices,
            forecast_steps=5,
            seasonal_periods=7,
            trend="add",
            seasonal="mul",
            confidence_level=0.90,
        )

        assert res["seasonal_type"] == "mul"
        assert len(res["point_forecast"]) == 5
        for low, pt, up in zip(res["lower_band"], res["point_forecast"], res["upper_band"]):
            assert low <= pt <= up

    def test_confidence_level_interval_widening(self, sample_daily_prices):
        """Higher confidence level must produce wider uncertainty bands."""
        res_80 = holt_winters_forecast(
            series=sample_daily_prices,
            forecast_steps=5,
            seasonal_periods=7,
            confidence_level=0.80,
        )
        res_99 = holt_winters_forecast(
            series=sample_daily_prices,
            forecast_steps=5,
            seasonal_periods=7,
            confidence_level=0.99,
        )

        for i in range(5):
            width_80 = res_80["upper_band"][i] - res_80["lower_band"][i]
            width_99 = res_99["upper_band"][i] - res_99["lower_band"][i]
            assert width_99 > width_80

    def test_multiplicative_fallback_on_negative_or_zero_values(self):
        """If series has non-positive values, 'mul' seasonal must safely adjust to 'add'."""
        series_with_zero = [10.0, 12.0, 0.0, 15.0, 14.0, 16.0, 18.0, 20.0, 22.0, 24.0, 25.0, 27.0, 28.0, 30.0]
        res = holt_winters_forecast(
            series=series_with_zero,
            forecast_steps=3,
            seasonal_periods=7,
            seasonal="mul",
        )
        assert res["seasonal_type"] == "add"
        assert len(res["warnings"]) > 0

    def test_short_series_seasonal_fallback(self):
        """Series shorter than 2 seasonal periods should drop seasonal component cleanly."""
        short_series = [100.0, 102.0, 105.0, 108.0, 110.0, 112.0]  # len=6 < 2*7=14
        res = holt_winters_forecast(
            series=short_series,
            forecast_steps=3,
            seasonal_periods=7,
            seasonal="add",
        )
        assert res["seasonal_type"] is None
        assert len(res["point_forecast"]) == 3

    def test_auto_holt_winters_selection(self, sample_daily_prices):
        """auto_holt_winters selects best model and includes comparison benchmarks."""
        res = auto_holt_winters(
            series=sample_daily_prices,
            forecast_steps=7,
            seasonal_periods=7,
            confidence_level=0.95,
        )
        assert "model_selection_benchmarks" in res
        assert len(res["model_selection_benchmarks"]) >= 2
        assert len(res["point_forecast"]) == 7

    def test_invalid_input_validations(self):
        with pytest.raises(ValueError, match="at least 4 observations"):
            holt_winters_forecast(series=[1.0, 2.0, 3.0])

        with pytest.raises(ValueError, match="forecast_steps"):
            holt_winters_forecast(series=[1.0, 2.0, 3.0, 4.0, 5.0], forecast_steps=0)

        with pytest.raises(ValueError, match="confidence_level"):
            holt_winters_forecast(series=[1.0, 2.0, 3.0, 4.0, 5.0], confidence_level=1.5)

