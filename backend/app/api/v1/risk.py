from fastapi import APIRouter
from app.schemas.risk import VaRRequest, MonteCarloRequest, HedgeOptimizeRequest
from app.math.risk_analytics import (
    calculate_parametric_var,
    run_monte_carlo_crush_sim,
    run_stress_test,
)
from app.math.hedging import (
    calculate_optimal_hedge_ratio,
    calculate_cbot_contracts,
)

router = APIRouter()

@router.post("/var")
async def get_value_at_risk(req: VaRRequest):
    var_95 = calculate_parametric_var(
        portfolio_value=req.portfolio_value,
        daily_volatility=req.daily_volatility,
        holding_period_days=req.holding_period_days,
        confidence_level=0.95,
    )
    var_99 = calculate_parametric_var(
        portfolio_value=req.portfolio_value,
        daily_volatility=req.daily_volatility,
        holding_period_days=req.holding_period_days,
        confidence_level=0.99,
    )
    return {
        "portfolio_value": req.portfolio_value,
        "holding_period_days": req.holding_period_days,
        "daily_volatility_pct": round(req.daily_volatility * 100.0, 2),
        "var_95_percent": var_95,
        "var_99_percent": var_99,
        "expected_shortfall_95": round(var_95 * 1.25, 2),
    }

@router.post("/monte-carlo")
async def get_monte_carlo_simulation(req: MonteCarloRequest):
    return run_monte_carlo_crush_sim(
        current_bean_price=req.bean_price,
        current_meal_price=req.meal_price,
        current_oil_price_cents=req.oil_price_cents,
        days=req.days,
        num_simulations=req.simulations,
    )

@router.get("/stress-test")
async def get_stress_test(
    bean_price: float = 10.25,
    meal_price: float = 312.0,
    oil_price_cents: float = 44.5,
):
    return run_stress_test(bean_price, meal_price, oil_price_cents)

@router.post("/hedge-optimize")
async def optimize_hedge(req: HedgeOptimizeRequest):
    # Simulated recent daily spot and futures changes
    spot_chg = req.spot_changes or [0.12, -0.08, 0.15, -0.22, 0.05, 0.18, -0.14, 0.09, -0.03, 0.25]
    fut_chg = req.futures_changes or [0.10, -0.07, 0.16, -0.20, 0.04, 0.17, -0.12, 0.08, -0.02, 0.22]

    mvhr = calculate_optimal_hedge_ratio(spot_chg, fut_chg)
    effective_ratio = req.hedge_ratio if req.hedge_ratio > 0 else mvhr["optimal_hedge_ratio"]
    contracts = calculate_cbot_contracts(
        bushels_to_crush=req.bushels,
        hedge_ratio=effective_ratio,
    )

    return {
        "analysis": mvhr,
        "contracts_allocation": contracts,
    }

