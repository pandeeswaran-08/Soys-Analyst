from datetime import datetime, timedelta
from typing import List, Dict, Any
import numpy as np


class SeedService:
    @staticmethod
    def get_sample_market_quotes() -> Dict[str, List[Dict[str, Any]]]:
        """Returns realistic CBOT futures quotes for beans, meal, and oil."""
        return {
            "soybeans": [
                {"symbol": "ZSF25", "name": "Soybeans Jan 25", "contract_month": "Jan 25", "price": 1024.50, "change": +8.25, "change_pct": +0.81, "volume": 124800, "open_interest": 284100, "unit": "cents/bu"},
                {"symbol": "ZSH25", "name": "Soybeans Mar 25", "contract_month": "Mar 25", "price": 1038.25, "change": +7.50, "change_pct": +0.73, "volume": 94100, "open_interest": 192400, "unit": "cents/bu"},
                {"symbol": "ZSK25", "name": "Soybeans May 25", "contract_month": "May 25", "price": 1051.75, "change": +6.00, "change_pct": +0.57, "volume": 58300, "open_interest": 142100, "unit": "cents/bu"},
                {"symbol": "ZSN25", "name": "Soybeans Jul 25", "contract_month": "Jul 25", "price": 1062.00, "change": +5.25, "change_pct": +0.50, "volume": 42100, "open_interest": 110900, "unit": "cents/bu"},
                {"symbol": "ZSQ25", "name": "Soybeans Aug 25", "contract_month": "Aug 25", "price": 1056.50, "change": +4.75, "change_pct": +0.45, "volume": 18400, "open_interest": 45300, "unit": "cents/bu"},
                {"symbol": "ZSX25", "name": "Soybeans Nov 25", "contract_month": "Nov 25", "price": 1045.00, "change": +3.50, "change_pct": +0.34, "volume": 31200, "open_interest": 88400, "unit": "cents/bu"},
            ],
            "meal": [
                {"symbol": "ZMF25", "name": "Soybean Meal Jan 25", "contract_month": "Jan 25", "price": 314.80, "change": +2.40, "change_pct": +0.77, "volume": 68200, "open_interest": 154200, "unit": "$/ton"},
                {"symbol": "ZMH25", "name": "Soybean Meal Mar 25", "contract_month": "Mar 25", "price": 318.50, "change": +1.90, "change_pct": +0.60, "volume": 51000, "open_interest": 118400, "unit": "$/ton"},
                {"symbol": "ZMK25", "name": "Soybean Meal May 25", "contract_month": "May 25", "price": 322.10, "change": +1.50, "change_pct": +0.47, "volume": 34100, "open_interest": 89200, "unit": "$/ton"},
                {"symbol": "ZMN25", "name": "Soybean Meal Jul 25", "contract_month": "Jul 25", "price": 326.40, "change": +1.20, "change_pct": +0.37, "volume": 28400, "open_interest": 72100, "unit": "$/ton"},
            ],
            "oil": [
                {"symbol": "ZLF25", "name": "Soybean Oil Jan 25", "contract_month": "Jan 25", "price": 44.65, "change": +0.58, "change_pct": +1.32, "volume": 58900, "open_interest": 141200, "unit": "cents/lb"},
                {"symbol": "ZLH25", "name": "Soybean Oil Mar 25", "contract_month": "Mar 25", "price": 45.10, "change": +0.52, "change_pct": +1.17, "volume": 47200, "open_interest": 105600, "unit": "cents/lb"},
                {"symbol": "ZLK25", "name": "Soybean Oil May 25", "contract_month": "May 25", "price": 45.45, "change": +0.46, "change_pct": +1.02, "volume": 31800, "open_interest": 79400, "unit": "cents/lb"},
                {"symbol": "ZLN25", "name": "Soybean Oil Jul 25", "contract_month": "Jul 25", "price": 45.80, "change": +0.40, "change_pct": +0.88, "volume": 24500, "open_interest": 61200, "unit": "cents/lb"},
            ],
        }

    @staticmethod
    def get_sample_basis_bids() -> List[Dict[str, Any]]:
        """Returns regional grain basis bids across key US grain hubs."""
        return [
            {"location_name": "Decatur, IL Processing Plant", "location_type": "Crush Plant", "commodity": "Soybeans", "basis_cents": +12.0, "delivery_period": "Nov Spot", "freight_rate_cents": 8.0},
            {"location_name": "Cedar Rapids, IA Plant", "location_type": "Crush Plant", "commodity": "Soybeans", "basis_cents": +5.0, "delivery_period": "Nov Spot", "freight_rate_cents": 10.0},
            {"location_name": "Illinois River Terminal (Morris)", "location_type": "River Terminal", "commodity": "Soybeans", "basis_cents": -18.0, "delivery_period": "Nov Spot", "freight_rate_cents": 14.5},
            {"location_name": "CIF Gulf NOLA (Barge)", "location_type": "Export Port", "commodity": "Soybeans", "basis_cents": +68.0, "delivery_period": "Nov 1H", "freight_rate_cents": 42.0},
            {"location_name": "Pacific Northwest (PNW Shuttle)", "location_type": "Export Port", "commodity": "Soybeans", "basis_cents": +125.0, "delivery_period": "Nov", "freight_rate_cents": 95.0},
            {"location_name": "Northwest Iowa Country Elevator", "location_type": "Country Elevator", "commodity": "Soybeans", "basis_cents": -45.0, "delivery_period": "Nov Spot", "freight_rate_cents": 18.0},
        ]

    @staticmethod
    def generate_historical_series(days: int = 90) -> List[Dict[str, Any]]:
        """Generates realistic correlated historical daily data for Soybeans, Meal, Oil, and Crush Margin."""
        np.random.seed(101)
        base_date = datetime.utcnow() - timedelta(days=days)
        history = []

        bean_price = 1010.0
        meal_price = 305.0
        oil_price = 42.5

        for i in range(days):
            date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")

            # Daily shocks with realistic drift
            d_bean = np.random.normal(0.4, 6.5)
            d_meal = np.random.normal(0.15, 2.2)
            d_oil = np.random.normal(0.04, 0.45)

            bean_price = max(800.0, bean_price + d_bean)
            meal_price = max(250.0, meal_price + d_meal)
            oil_price = max(30.0, oil_price + d_oil)

            # Board crush in cents/bu
            meal_rev_cents = (meal_price * 44.0 / 2000.0) * 100.0
            oil_rev_cents = oil_price * 11.0
            board_crush_cents = (meal_rev_cents + oil_rev_cents) - bean_price
            board_crush_dollars = board_crush_cents / 100.0

            history.append({
                "date": date_str,
                "soybean_price": round(bean_price, 2),
                "meal_price": round(meal_price, 2),
                "oil_price": round(oil_price, 2),
                "board_crush_cents": round(board_crush_cents, 2),
                "board_crush_dollars": round(board_crush_dollars, 4),
                "basis_interior": round(-25.0 + 5.0 * np.sin(i / 10.0) + np.random.normal(0, 1.5), 1),
                "oil_share_pct": round((oil_rev_cents / (meal_rev_cents + oil_rev_cents)) * 100.0, 2),
            })

        return history

