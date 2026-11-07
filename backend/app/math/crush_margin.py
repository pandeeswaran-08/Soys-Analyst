"""
Soybean Crush Margin Mathematical Engine
Provides exact mathematical formulas for Board Crush, Gross Processing Margin (GPM),
Net Processing Margin (NPM), Oil Share, and Margin Sensitivity Greeks.

Industry Standards (CBOT):
- 1 Bushel of Soybeans weighs 60 lbs.
- Standard industrial crush yields:
    - 44.0 to 48.0 lbs of Soybean Meal (~0.022 to 0.024 short tons)
    - 11.0 lbs of Soybean Oil
    - ~4 to 5 lbs of hulls / moisture loss
- Soybean Futures (ZS): quoted in cents/bushel (or $/bushel)
- Soybean Meal Futures (ZM): quoted in $/short ton (2,000 lbs)
- Soybean Oil Futures (ZL): quoted in cents/lb
"""

from typing import Dict, Any
import numpy as np


def calculate_board_crush(
    soybean_price_cents_per_bu: float,
    meal_price_dollars_per_ton: float,
    oil_price_cents_per_lb: float,
    meal_yield_lbs: float = 44.0,
    oil_yield_lbs: float = 11.0,
) -> float:
    """
    Calculate the Board Crush margin in cents per bushel.
    Formula:
    Board Crush (cents/bu) = (Meal $/ton * meal_yield / 2000 * 100) + (Oil cents/lb * oil_yield) - Soybean cents/bu
    """
    meal_rev_cents = (meal_price_dollars_per_ton * meal_yield_lbs / 2000.0) * 100.0
    oil_rev_cents = oil_price_cents_per_lb * oil_yield_lbs
    gross_product_value_cents = meal_rev_cents + oil_rev_cents
    return gross_product_value_cents - soybean_price_cents_per_bu


def calculate_gross_processing_margin(
    soybean_price_dollars_per_bu: float,
    meal_price_dollars_per_ton: float,
    oil_price_dollars_per_lb: float,
    meal_yield_lbs: float = 44.0,
    oil_yield_lbs: float = 11.0,
) -> float:
    """
    Calculate the Gross Processing Margin (GPM) in Dollars per bushel.
    Formula:
    GPM ($/bu) = (Meal $/ton * meal_yield / 2000) + (Oil $/lb * oil_yield) - Soybean $/bu
    """
    meal_revenue = (meal_price_dollars_per_ton * meal_yield_lbs) / 2000.0
    oil_revenue = oil_price_dollars_per_lb * oil_yield_lbs
    return (meal_revenue + oil_revenue) - soybean_price_dollars_per_bu


def calculate_oil_share(
    meal_price_dollars_per_ton: float,
    oil_price_cents_per_lb: float,
    meal_yield_lbs: float = 44.0,
    oil_yield_lbs: float = 11.0,
) -> float:
    """
    Calculate the percentage contribution of soybean oil to the total revenue of products.
    Oil Share (%) = [Oil Revenue / (Oil Revenue + Meal Revenue)] * 100
    """
    oil_rev = (oil_price_cents_per_lb / 100.0) * oil_yield_lbs
    meal_rev = (meal_price_dollars_per_ton / 2000.0) * meal_yield_lbs
    total_rev = oil_rev + meal_rev
    if total_rev <= 0:
        return 0.0
    return (oil_rev / total_rev) * 100.0


def calculate_crush_sensitivities(
    meal_yield_lbs: float = 44.0,
    oil_yield_lbs: float = 11.0,
) -> Dict[str, float]:
    """
    Partial derivatives (Greeks) for crush margin per unit change in input/outputs.
    d(GPM)/d(Soybean $/bu) = -1.0
    d(GPM)/d(Meal $/ton) = meal_yield / 2000
    d(GPM)/d(Oil cents/lb) = oil_yield / 100
    """
    return {
        "delta_per_dollar_bean": -1.0,
        "delta_per_dollar_meal_ton": meal_yield_lbs / 2000.0,
        "delta_per_cent_oil_lb": oil_yield_lbs / 100.0,
        "delta_per_dollar_oil_lb": oil_yield_lbs,
    }


def calculate_comprehensive_crush(
    soybean_price_bu: float,
    meal_price_ton: float,
    oil_price_lb_cents: float,
    operating_crush_cost_bu: float = 0.75,
    basis_soybean_bu: float = 0.0,
    basis_meal_ton: float = 0.0,
    basis_oil_cents_lb: float = 0.0,
    meal_yield_lbs: float = 44.0,
    oil_yield_lbs: float = 11.0,
) -> Dict[str, Any]:
    """
    Computes physical cash and board margins, factoring in local basis and operating plant costs.
    """
    # Board level (futures)
    board_crush_cents = calculate_board_crush(
        soybean_price_cents_per_bu=soybean_price_bu * 100.0,
        meal_price_dollars_per_ton=meal_price_ton,
        oil_price_cents_per_lb=oil_price_lb_cents,
        meal_yield_lbs=meal_yield_lbs,
        oil_yield_lbs=oil_yield_lbs,
    )
    board_crush_dollars = board_crush_cents / 100.0

    # Cash level (with basis)
    cash_soybean_bu = soybean_price_bu + basis_soybean_bu
    cash_meal_ton = meal_price_ton + basis_meal_ton
    cash_oil_cents_lb = oil_price_lb_cents + basis_oil_cents_lb

    cash_gpm_cents = calculate_board_crush(
        soybean_price_cents_per_bu=cash_soybean_bu * 100.0,
        meal_price_dollars_per_ton=cash_meal_ton,
        oil_price_cents_per_lb=cash_oil_cents_lb,
        meal_yield_lbs=meal_yield_lbs,
        oil_yield_lbs=oil_yield_lbs,
    )
    cash_gpm_dollars = cash_gpm_cents / 100.0
    net_processing_margin = cash_gpm_dollars - operating_crush_cost_bu

    oil_share = calculate_oil_share(
        meal_price_dollars_per_ton=cash_meal_ton,
        oil_price_cents_per_lb=cash_oil_cents_lb,
        meal_yield_lbs=meal_yield_lbs,
        oil_yield_lbs=oil_yield_lbs,
    )

    sensitivities = calculate_crush_sensitivities(meal_yield_lbs, oil_yield_lbs)

    # Meal revenue and oil revenue per bushel
    meal_rev_bu = (cash_meal_ton * meal_yield_lbs) / 2000.0
    oil_rev_bu = (cash_oil_cents_lb / 100.0) * oil_yield_lbs
    total_rev_bu = meal_rev_bu + oil_rev_bu

    return {
        "board_crush_cents_per_bu": round(board_crush_cents, 2),
        "board_crush_dollars_per_bu": round(board_crush_dollars, 4),
        "cash_gpm_dollars_per_bu": round(cash_gpm_dollars, 4),
        "net_processing_margin_dollars_per_bu": round(net_processing_margin, 4),
        "oil_share_percent": round(oil_share, 2),
        "meal_share_percent": round(100.0 - oil_share, 2),
        "product_value_dollars_per_bu": round(total_rev_bu, 4),
        "meal_revenue_dollars_per_bu": round(meal_rev_bu, 4),
        "oil_revenue_dollars_per_bu": round(oil_rev_bu, 4),
        "raw_bean_cost_dollars_per_bu": round(cash_soybean_bu, 4),
        "operating_cost_dollars_per_bu": round(operating_crush_cost_bu, 4),
        "sensitivities": sensitivities,
    }

