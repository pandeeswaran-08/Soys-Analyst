from fastapi import APIRouter
from app.services.seed_service import SeedService
from app.math.econometrics import forecast_arima, calculate_rolling_volatility, test_stationarity_adf, test_cointegration

router = APIRouter()

@router.get("/arima")
async def get_arima_forecast(target: str = "crush_margin", steps: int = 14):
    history = SeedService.generate_historical_series(days=90)
    if target == "crush_margin":
        series = [h["board_crush_dollars"] for h in history]
    elif target == "soybeans":
        series = [h["soybean_price"] for h in history]
    elif target == "oil":
        series = [h["oil_price"] for h in history]
    else:
        series = [h["meal_price"] for h in history]

    forecast = forecast_arima(series, forecast_steps=steps)
    volatility = calculate_rolling_volatility(series)
    adf = test_stationarity_adf(series)

    return {
        "target": target,
        "steps": steps,
        "historical_count": len(series),
        "forecast": forecast,
        "volatility": volatility,
        "stationarity_adf": adf,
    }

@router.get("/cointegration")
async def get_cointegration_analysis():
    history = SeedService.generate_historical_series(days=90)
    beans = [h["soybean_price"] for h in history]
    # synthetic gross product value = (meal * 44 / 2000 * 100) + (oil * 11) in cents
    synth_products = [(h["meal_price"] * 44.0 / 2000.0 * 100.0) + (h["oil_price"] * 11.0) for h in history]

    coint_res = test_cointegration(beans, synth_products)
    return {
        "pair": "Soybean Futures (ZS) vs Synthetic Product Value (ZM + ZL)",
        "result": coint_res,
    }

