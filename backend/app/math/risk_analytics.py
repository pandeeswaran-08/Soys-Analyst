"""
Commodity Market Risk Analytics Engine
Provides Parametric VaR, Historical Simulation VaR, Expected Shortfall (CVaR),
correlated multi-asset Monte Carlo crush margin simulation, and macro stress tests.
"""

from typing import List, Dict, Any, Optional
import numpy as np
import scipy.stats as stats


def calculate_parametric_var(
    portfolio_value: float,
    daily_volatility: float,
    holding_period_days: int = 1,
    confidence_level: float = 0.95,
) -> float:
    """
    Parametric (Delta-Normal) Value-at-Risk.
    VaR = Portfolio_Value * Z_alpha * sigma_daily * sqrt(T)
    """
    z_score = stats.norm.ppf(confidence_level)
    var = portfolio_value * z_score * daily_volatility * np.sqrt(holding_period_days)
    return round(float(var), 2)


def calculate_historical_var(
    historical_pnl_or_returns: List[float],
    portfolio_value: Optional[float] = None,
    confidence_level: float = 0.95,
) -> Dict[str, float]:
    """
    Historical Simulation Value-at-Risk and Expected Shortfall (CVaR).
    """
    arr = np.array(historical_pnl_or_returns)
    if len(arr) == 0:
        return {"var": 0.0, "cvar": 0.0}

    # Percentile of loss (lower tail of returns)
    alpha = 1.0 - confidence_level
    var_threshold = np.percentile(arr, alpha * 100.0)
    tail_losses = arr[arr <= var_threshold]
    cvar_threshold = np.mean(tail_losses) if len(tail_losses) > 0 else var_threshold

    if portfolio_value is not None:
        # If input was returns
        var_dollar = abs(float(var_threshold)) * portfolio_value
        cvar_dollar = abs(float(cvar_threshold)) * portfolio_value
    else:
        var_dollar = abs(float(var_threshold))
        cvar_dollar = abs(float(cvar_threshold))

    return {
        "confidence_level": confidence_level,
        "var": round(var_dollar, 2),
        "expected_shortfall_cvar": round(cvar_dollar, 2),
    }


def calculate_expected_shortfall(
    losses: List[float],
    confidence_level: float = 0.95,
) -> float:
    """Average loss beyond the VaR threshold."""
    arr = np.array(losses)
    threshold = np.percentile(arr, confidence_level * 100.0)
    tail = arr[arr >= threshold]
    return round(float(np.mean(tail)), 2) if len(tail) > 0 else round(float(threshold), 2)


def run_monte_carlo_crush_sim(
    current_bean_price: float,
    current_meal_price: float,
    current_oil_price_cents: float,
    annual_vol_bean: float = 0.22,
    annual_vol_meal: float = 0.20,
    annual_vol_oil: float = 0.26,
    days: int = 30,
    num_simulations: int = 1000,
) -> Dict[str, Any]:
    """
    Correlated Geometric Brownian Motion (GBM) simulation of Soybean, Meal, and Oil prices
    to determine the simulated crush margin distribution over N days.
    """
    np.random.seed(42)
    dt = 1.0 / 252.0

    # Historical correlation matrix: [Soybeans, Meal, Oil]
    # Beans correlate ~0.75 with Meal and ~0.65 with Oil; Meal and Oil correlate ~0.35
    corr_matrix = np.array([
        [1.00, 0.72, 0.62],
        [0.72, 1.00, 0.38],
        [0.62, 0.38, 1.00],
    ])

    chol = np.linalg.cholesky(corr_matrix)

    # Standard normal draws
    simulated_final_margins = []
    trajectories = []

    for sim in range(num_simulations):
        sb = current_bean_price
        sm = current_meal_price
        so = current_oil_price_cents

        path = []
        for step in range(days):
            z = np.random.normal(0, 1, size=3)
            eps = chol @ z

            sb *= np.exp((-0.5 * annual_vol_bean**2) * dt + annual_vol_bean * np.sqrt(dt) * eps[0])
            sm *= np.exp((-0.5 * annual_vol_meal**2) * dt + annual_vol_meal * np.sqrt(dt) * eps[1])
            so *= np.exp((-0.5 * annual_vol_oil**2) * dt + annual_vol_oil * np.sqrt(dt) * eps[2])

            # Board crush in cents/bu: (Meal $/ton * 0.022 * 100) + (Oil cents * 11) - Beans cents
            # Or in $/bu:
            margin_bu = ((sm * 44.0) / 2000.0) + ((so / 100.0) * 11.0) - sb
            path.append(margin_bu)

        simulated_final_margins.append(path[-1])
        if sim < 15:  # Store first 15 representative paths for charting
            trajectories.append([round(float(v), 3) for v in path])

    margin_arr = np.array(simulated_final_margins)
    current_margin = ((current_meal_price * 44.0) / 2000.0) + ((current_oil_price_cents / 100.0) * 11.0) - current_bean_price

    return {
        "initial_margin_dollars_bu": round(float(current_margin), 4),
        "mean_simulated_margin": round(float(np.mean(margin_arr)), 4),
        "median_simulated_margin": round(float(np.median(margin_arr)), 4),
        "std_dev_margin": round(float(np.std(margin_arr)), 4),
        "p5_downside_margin": round(float(np.percentile(margin_arr, 5)), 4),
        "p95_upside_margin": round(float(np.percentile(margin_arr, 95)), 4),
        "prob_negative_crush_pct": round(float(np.sum(margin_arr < 0.75) / num_simulations * 100.0), 2),
        "sample_paths": trajectories,
    }


def run_stress_test(
    current_bean_bu: float,
    current_meal_ton: float,
    current_oil_lb_cents: float,
) -> Dict[str, Any]:
    """
    Stress-testing standard commercial crushing scenarios.
    """
    base_margin = ((current_meal_ton * 44.0) / 2000.0) + ((current_oil_lb_cents / 100.0) * 11.0) - current_bean_bu

    scenarios = {
        "Drought Shock (Midwest yields drop, Beans +18%, Meal +10%, Oil +8%)": {
            "bean_mult": 1.18,
            "meal_mult": 1.10,
            "oil_mult": 1.08,
            "description": "Raw input bean costs spike faster than product yields can be passed downstream.",
        },
        "China Export Tariffs (Export curbs, Beans -12%, Meal -8%, Oil +2%)": {
            "bean_mult": 0.88,
            "meal_mult": 0.92,
            "oil_mult": 1.02,
            "description": "Domestic bean glut expands local processing margins.",
        },
        "Renewable Diesel Boom (EPA RFS increase, Beans +6%, Meal +2%, Oil +28%)": {
            "bean_mult": 1.06,
            "meal_mult": 1.02,
            "oil_mult": 1.28,
            "description": "High biofuel feed demand elevates oil share above 45%.",
        },
        "Global Livestock Demand Slump (Swine herd liquidation, Beans -4%, Meal -22%, Oil -5%)": {
            "bean_mult": 0.96,
            "meal_mult": 0.78,
            "oil_mult": 0.95,
            "description": "Depressed meal consumption compresses crush margins severely.",
        },
    }

    results = {}
    for name, params in scenarios.items():
        sb = current_bean_bu * params["bean_mult"]
        sm = current_meal_ton * params["meal_mult"]
        so = current_oil_lb_cents * params["oil_mult"]
        stressed_margin = ((sm * 44.0) / 2000.0) + ((so / 100.0) * 11.0) - sb
        pnl_change_per_bu = stressed_margin - base_margin

        results[name] = {
            "stressed_margin_dollars_bu": round(stressed_margin, 4),
            "margin_delta_dollars_bu": round(pnl_change_per_bu, 4),
            "percentage_change": round((pnl_change_per_bu / abs(base_margin)) * 100.0, 2),
            "description": params["description"],
        }

    return {
        "baseline_margin_dollars_bu": round(base_margin, 4),
        "scenarios": results,
    }

