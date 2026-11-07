"""
Holt-Winters Econometric Forecasting Engine
Pure, deterministic time-series forecasting using statsmodels ExponentialSmoothing.
Implements additive and multiplicative trend-seasonal models with statistical uncertainty bands.

All functions are side-effect free, fully typed, and return clear dictionaries.
"""

from typing import List, Dict, Any, Optional, Tuple, Literal
import numpy as np
import scipy.stats as stats
from statsmodels.tsa.holtwinters import ExponentialSmoothing


def calculate_forecast_metrics(actual: np.ndarray, fitted: np.ndarray) -> Dict[str, float]:
    """Computes standard in-sample regression/time-series error metrics."""
    errors = actual - fitted
    mae = float(np.mean(np.abs(errors)))
    rmse = float(np.sqrt(np.mean(errors ** 2)))
    
    # Avoid division by zero in MAPE
    non_zero_mask = np.abs(actual) > 1e-6
    if np.any(non_zero_mask):
        mape = float(np.mean(np.abs(errors[non_zero_mask] / actual[non_zero_mask])) * 100.0)
    else:
        mape = 0.0

    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "mape_pct": round(mape, 2),
    }


def holt_winters_forecast(
    series: List[float],
    forecast_steps: int = 14,
    seasonal_periods: int = 7,
    trend: Literal["add", "mul", None] = "add",
    seasonal: Literal["add", "mul", None] = "add",
    confidence_level: float = 0.95,
    damped_trend: bool = False,
) -> Dict[str, Any]:
    """
    Fits a Holt-Winters Exponential Smoothing model on a commodity price/cost series
    and projects future values with upper and lower uncertainty bands.

    Formulas:
        Additive Level:       L_t = alpha * (y_t - S_{t-m}) + (1 - alpha) * (L_{t-1} + b_{t-1})
        Additive Trend:       b_t = beta * (L_t - L_{t-1}) + (1 - beta) * b_{t-1}
        Additive Seasonality: S_t = gamma * (y_t - L_{t-1} - b_{t-1}) + (1 - gamma) * S_{t-m}
        Forecast (h steps):   y_{t+h} = L_t + h * b_t + S_{t+h-m}

        Multiplicative Level:       L_t = alpha * (y_t / S_{t-m}) + (1 - alpha) * (L_{t-1} + b_{t-1})
        Multiplicative Trend:       b_t = beta * (L_t - L_{t-1}) + (1 - beta) * b_{t-1}
        Multiplicative Seasonality: S_t = gamma * (y_t / (L_{t-1} + b_{t-1})) + (1 - gamma) * S_{t-m}
        Forecast (h steps):         y_{t+h} = (L_t + h * b_t) * S_{t+h-m}

    Args:
        series: Historical time-series observations (minimum 2 * seasonal_periods for full seasonal models)
        forecast_steps: Number of forward periods to project (h >= 1)
        seasonal_periods: Length of seasonality cycle (e.g. 7 for weekly/daily, 12 for monthly)
        trend: 'add', 'mul', or None
        seasonal: 'add', 'mul', or None
        confidence_level: Two-sided prediction interval confidence (e.g. 0.95 or 0.80)
        damped_trend: Whether to apply a damping parameter phi to the trend

    Returns:
        Structured dictionary with model configuration, point forecasts, uncertainty bands,
        in-sample accuracy metrics, and smoothing parameters.
    """
    if not series or len(series) < 4:
        raise ValueError("Series must contain at least 4 observations for forecasting")
    if forecast_steps < 1:
        raise ValueError("forecast_steps must be at least 1")
    if confidence_level <= 0 or confidence_level >= 1:
        raise ValueError("confidence_level must be between 0 and 1 exclusive")

    arr = np.array(series, dtype=float)

    # Check for non-positive values when using multiplicative components
    adjusted_trend = trend
    adjusted_seasonal = seasonal
    warnings = []

    has_non_positive = np.any(arr <= 0)
    if has_non_positive:
        if trend == "mul":
            adjusted_trend = "add"
            warnings.append("Series contains non-positive values; adjusted trend from 'mul' to 'add'")
        if seasonal == "mul":
            adjusted_seasonal = "add"
            warnings.append("Series contains non-positive values; adjusted seasonal from 'mul' to 'add'")

    # Fallback to non-seasonal if series is shorter than 2 complete seasonal cycles
    min_seasonal_len = 2 * seasonal_periods
    if len(arr) < min_seasonal_len and adjusted_seasonal is not None:
        adjusted_seasonal = None
        warnings.append(
            f"Series length ({len(arr)}) is less than 2 cycles ({min_seasonal_len}); running Holt's linear (non-seasonal)"
        )

    # Fit the ExponentialSmoothing model
    model = ExponentialSmoothing(
        arr,
        trend=adjusted_trend,
        damped_trend=damped_trend if adjusted_trend is not None else False,
        seasonal=adjusted_seasonal,
        seasonal_periods=seasonal_periods if adjusted_seasonal is not None else None,
        initialization_method="estimated",
    )
    fitted_model = model.fit(optimized=True)

    # Forecast point estimates
    point_forecasts = fitted_model.forecast(steps=forecast_steps)
    point_list = [round(float(v), 4) for v in point_forecasts]

    # In-sample fitted values and residuals
    fitted_values = fitted_model.fittedvalues
    residuals = arr - fitted_values
    dof = max(len(arr) - len(fitted_model.params), 1)
    resid_std = float(np.sqrt(np.sum(residuals ** 2) / dof))

    # Compute prediction uncertainty intervals
    z_score = float(stats.norm.ppf(1.0 - (1.0 - confidence_level) / 2.0))
    alpha = getattr(fitted_model.params, "get", lambda k, default=0.3: default)("smoothing_level", 0.3)
    if not isinstance(alpha, (int, float)):
        alpha = 0.3

    lower_bands: List[float] = []
    upper_bands: List[float] = []

    for h in range(1, forecast_steps + 1):
        # Forecast standard error widening with horizon h
        # Var(e_t+h) = sigma^2 * (1 + sum_{j=1}^{h-1} c_j^2)
        variance_multiplier = 1.0 + (float(alpha) ** 2) * (h - 1) * 0.5
        horizon_se = resid_std * np.sqrt(variance_multiplier)
        half_width = z_score * horizon_se

        f_val = point_list[h - 1]
        lower_b = max(0.0, f_val - half_width)  # Non-negative price floor
        upper_b = f_val + half_width

        lower_bands.append(round(float(lower_b), 4))
        upper_bands.append(round(float(upper_b), 4))

    # Error metrics
    metrics = calculate_forecast_metrics(arr, fitted_values)
    aic = round(float(fitted_model.aic), 2) if hasattr(fitted_model, "aic") and not np.isnan(fitted_model.aic) else None
    bic = round(float(fitted_model.bic), 2) if hasattr(fitted_model, "bic") and not np.isnan(fitted_model.bic) else None

    # Smoothing parameters
    params_dict = {}
    for p_name in ["smoothing_level", "smoothing_trend", "smoothing_seasonal", "damping_trend"]:
        val = fitted_model.params.get(p_name)
        if val is not None and not np.isnan(val):
            params_dict[p_name] = round(float(val), 4)

    return {
        "model_type": "Holt-Winters Exponential Smoothing",
        "trend_type": adjusted_trend,
        "seasonal_type": adjusted_seasonal,
        "seasonal_periods": seasonal_periods if adjusted_seasonal is not None else None,
        "damped_trend": damped_trend,
        "confidence_level": confidence_level,
        "z_score": round(z_score, 4),
        "residual_std": round(resid_std, 4),
        "point_forecast": point_list,
        "lower_band": lower_bands,
        "upper_band": upper_bands,
        "in_sample_metrics": {
            **metrics,
            "aic": aic,
            "bic": bic,
        },
        "fitted_parameters": params_dict,
        "warnings": warnings,
    }


def auto_holt_winters(
    series: List[float],
    forecast_steps: int = 14,
    seasonal_periods: int = 7,
    confidence_level: float = 0.95,
) -> Dict[str, Any]:
    """
    Fits both Additive and Multiplicative Holt-Winters models, benchmarks in-sample RMSE,
    and automatically returns the superior statistical model.
    """
    candidates = [
        {"trend": "add", "seasonal": "add", "damped": False, "name": "Additive"},
        {"trend": "add", "seasonal": "add", "damped": True, "name": "Additive Damped"},
    ]

    # Only include multiplicative if data is strictly positive
    if np.all(np.array(series) > 0) and len(series) >= 2 * seasonal_periods:
        candidates.append({"trend": "mul", "seasonal": "mul", "damped": False, "name": "Multiplicative"})

    best_result = None
    best_rmse = float("inf")
    benchmark_comparison = []

    for cand in candidates:
        try:
            res = holt_winters_forecast(
                series=series,
                forecast_steps=forecast_steps,
                seasonal_periods=seasonal_periods,
                trend=cand["trend"],  # type: ignore
                seasonal=cand["seasonal"],  # type: ignore
                confidence_level=confidence_level,
                damped_trend=cand["damped"],
            )
            rmse = res["in_sample_metrics"]["rmse"]
            benchmark_comparison.append({
                "model_name": cand["name"],
                "trend": cand["trend"],
                "seasonal": cand["seasonal"],
                "rmse": rmse,
                "mape_pct": res["in_sample_metrics"]["mape_pct"],
                "aic": res["in_sample_metrics"]["aic"],
            })
            if rmse < best_rmse:
                best_rmse = rmse
                best_result = res
        except Exception as e:
            benchmark_comparison.append({"model_name": cand["name"], "error": str(e)})

    if best_result is None:
        # Ultimate fallback to simple additive
        best_result = holt_winters_forecast(series, forecast_steps=forecast_steps)

    best_result["model_selection_benchmarks"] = benchmark_comparison
    return best_result

