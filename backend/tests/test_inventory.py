"""
Unit tests for backend/math_core/inventory.py
Audited tests verifying safety stock, reorder point, EOQ, and position evaluations.
"""

import pytest
import numpy as np
from backend.math_core.inventory import (
    calculate_safety_stock,
    calculate_reorder_point,
    calculate_economic_order_quantity,
    evaluate_inventory_position,
)


class TestSafetyStock:
    def test_safety_stock_constant_lead_time(self):
        """SS = Z * sigma_D * sqrt(L)."""
        d_avg = 100.0  # MT/day
        sigma_d = 15.0  # MT/day
        l_days = 9.0  # days
        sl = 0.95  # Z ~= 1.64485

        res = calculate_safety_stock(
            average_daily_demand=d_avg,
            demand_std_dev=sigma_d,
            lead_time_days=l_days,
            lead_time_std_dev=0.0,
            service_level=sl,
        )

        expected_z = 1.64485
        expected_ss = expected_z * sigma_d * np.sqrt(l_days)  # 1.64485 * 15 * 3 = 74.02
        assert abs(res["safety_stock_units"] - expected_ss) < 0.1
        assert abs(res["buffer_coverage_days"] - (expected_ss / d_avg)) < 0.05
        assert res["variance_breakdown"]["lead_time_variance_contribution"] == 0.0

    def test_safety_stock_both_variable(self):
        """SS = Z * sqrt(L * sigma_D^2 + D_avg^2 * sigma_L^2)."""
        d_avg = 200.0
        sigma_d = 20.0
        l_days = 4.0
        sigma_l = 1.0
        sl = 0.99  # Z ~= 2.3263

        res = calculate_safety_stock(
            average_daily_demand=d_avg,
            demand_std_dev=sigma_d,
            lead_time_days=l_days,
            lead_time_std_dev=sigma_l,
            service_level=sl,
        )

        # Variance = 4 * 400 + 40000 * 1 = 1600 + 40000 = 41600
        # Combined std = sqrt(41600) ~= 203.96
        # SS = 2.3263 * 203.96 ~= 474.47
        expected_combined_std = np.sqrt(l_days * (sigma_d ** 2) + (d_avg ** 2) * (sigma_l ** 2))
        expected_ss = 2.3263 * expected_combined_std
        assert abs(res["safety_stock_units"] - expected_ss) < 0.5
        assert res["z_score"] > 2.32

    def test_safety_stock_invalid_inputs(self):
        with pytest.raises(ValueError, match="average_daily_demand"):
            calculate_safety_stock(average_daily_demand=0.0, demand_std_dev=10.0, lead_time_days=5.0)

        with pytest.raises(ValueError, match="service_level"):
            calculate_safety_stock(average_daily_demand=100.0, demand_std_dev=10.0, lead_time_days=5.0, service_level=0.4)


class TestReorderPoint:
    def test_reorder_point_calculation(self):
        """ROP = (D_avg * L) + SS."""
        res = calculate_reorder_point(
            average_daily_demand=50.0,
            lead_time_days=10.0,
            safety_stock_units=120.0,
        )
        assert res["lead_time_demand_units"] == 500.0
        assert res["safety_stock_buffer_units"] == 120.0
        assert res["reorder_point_units"] == 620.0

    def test_reorder_point_negative_validation(self):
        with pytest.raises(ValueError, match="must be positive"):
            calculate_reorder_point(average_daily_demand=-10.0, lead_time_days=5.0, safety_stock_units=50.0)


class TestEconomicOrderQuantity:
    def test_eoq_exact_formula_and_cost_balance(self):
        """At true EOQ, annual ordering cost equals annual holding cost."""
        annual_demand = 12000.0  # units/year
        order_cost = 500.0       # per order
        holding_cost = 30.0      # per unit/year

        # EOQ = sqrt( (2 * 12000 * 500) / 30 ) = sqrt(12,000,000 / 30) = sqrt(400,000) = 632.4555
        res = calculate_economic_order_quantity(
            annual_demand_units=annual_demand,
            fixed_order_cost=order_cost,
            annual_holding_cost_per_unit=holding_cost,
        )

        expected_eoq = np.sqrt((2.0 * annual_demand * order_cost) / holding_cost)
        assert abs(res["economic_order_quantity_units"] - expected_eoq) < 0.1

        # Check ordering and holding cost equality at EOQ
        assert abs(res["annual_ordering_cost"] - res["annual_holding_cost"]) < 2.0
        assert res["orders_per_year"] == round(annual_demand / expected_eoq, 2)


class TestInventoryPositionEvaluation:
    def test_critical_stockout_risk_status(self):
        """When net position is below safety stock, must trigger CRITICAL_STOCKOUT_RISK."""
        res = evaluate_inventory_position(
            current_stock_on_hand=50.0,
            stock_in_transit=0.0,
            allocated_stock=10.0,  # Net = 40.0
            average_daily_demand=50.0,
            lead_time_days=7.0,
            demand_std_dev=10.0,
        )
        assert res["inventory_status"] == "CRITICAL_STOCKOUT_RISK"
        assert res["recommended_action"] == "EMERGENCY_REORDER"
        assert res["suggested_order_quantity_units"] > 0

    def test_reorder_now_status(self):
        """When net position is between safety stock and ROP, must trigger REORDER_NOW."""
        res = evaluate_inventory_position(
            current_stock_on_hand=360.0,
            stock_in_transit=0.0,
            allocated_stock=0.0,
            average_daily_demand=50.0,
            lead_time_days=7.0,  # Lead demand = 350, ROP = 393.52
            demand_std_dev=10.0,
        )
        assert res["inventory_status"] == "REORDER_NOW"
        assert res["recommended_action"] == "PLACE_STANDARD_ORDER"

    def test_healthy_inventory_status(self):
        """When net position is comfortably above ROP, must be HEALTHY."""
        res = evaluate_inventory_position(
            current_stock_on_hand=1500.0,
            stock_in_transit=200.0,
            allocated_stock=100.0,  # Net = 1600.0
            average_daily_demand=50.0,
            lead_time_days=7.0,
            demand_std_dev=10.0,
        )
        assert res["inventory_status"] == "HEALTHY"
        assert res["recommended_action"] == "NO_ORDER_NEEDED"

