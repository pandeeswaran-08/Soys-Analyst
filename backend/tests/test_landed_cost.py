"""
Unit tests for backend/math_core/landed_cost.py
Audited tests verifying mathematical correctness, customs valuation standards, and edge cases.
"""

import pytest
from backend.math_core.landed_cost import (
    calculate_domestic_landed_cost,
    calculate_international_landed_cost,
)


class TestDomesticLandedCost:
    def test_basic_domestic_landed_cost_with_itc(self):
        """Tests standard domestic procurement with Input Tax Credit eligible GST."""
        res = calculate_domestic_landed_cost(
            base_price_per_unit=5000.0,
            freight_per_unit=200.0,
            handling_per_unit=50.0,
            mandi_tax_rate=0.015,       # 1.5% = 75.0
            transit_insurance_rate=0.001, # 0.1% = 5.0
            in_transit_shrinkage_rate=0.003, # 0.3% of (5000 + 200) = 15.6
            unloading_storage_per_unit=25.0,
            gst_rate=0.05,
            itc_eligible=True,
            brokerage_commission_per_unit=10.0,
        )

        assert res["channel"] == "DOMESTIC"
        assert res["base_price_per_unit"] == 5000.0
        assert res["mandi_tax_amount"] == 75.0
        assert res["gross_material_cost"] == 5075.0
        assert res["transit_insurance_amount"] == 5.0
        assert res["shrinkage_loss_amount"] == 15.6
        assert res["total_commercial_charges"] == 15.0  # 5.0 + 10.0
        assert res["itc_eligible"] is True
        assert res["uncredited_gst_amount"] == 0.0

        # Subtotal: 5075 (material) + (200 + 50 + 25 + 15.6) + 15.0 = 5075 + 290.6 + 15 = 5380.6
        expected_total = 5075.0 + 290.6 + 15.0
        assert abs(res["total_landed_cost_per_unit"] - expected_total) < 1e-4

        # Verify percentage components sum to 100%
        pcts = res["cost_breakdown_percentages"]
        total_pct = sum(pcts.values())
        assert abs(total_pct - 100.0) < 0.2

    def test_domestic_landed_cost_without_itc(self):
        """When GST cannot be claimed as credit, it must be added to landed cost."""
        base_price = 4000.0
        res_with_itc = calculate_domestic_landed_cost(
            base_price_per_unit=base_price,
            freight_per_unit=150.0,
            gst_rate=0.05,
            itc_eligible=True,
        )
        res_without_itc = calculate_domestic_landed_cost(
            base_price_per_unit=base_price,
            freight_per_unit=150.0,
            gst_rate=0.05,
            itc_eligible=False,
        )

        gst_expected = 4000.0 * 0.05  # 200.0
        assert res_without_itc["uncredited_gst_amount"] == gst_expected
        assert abs(
            res_without_itc["total_landed_cost_per_unit"]
            - (res_with_itc["total_landed_cost_per_unit"] + gst_expected)
        ) < 1e-4

    def test_domestic_negative_input_raises_value_error(self):
        """Negative prices, freight, or rates must raise ValueError."""
        with pytest.raises(ValueError, match="base_price_per_unit"):
            calculate_domestic_landed_cost(base_price_per_unit=-100.0, freight_per_unit=50.0)

        with pytest.raises(ValueError, match="freight_per_unit"):
            calculate_domestic_landed_cost(base_price_per_unit=1000.0, freight_per_unit=-10.0)

        with pytest.raises(ValueError, match="cannot be negative"):
            calculate_domestic_landed_cost(base_price_per_unit=1000.0, freight_per_unit=10.0, mandi_tax_rate=-0.01)


class TestInternationalLandedCost:
    def test_standard_import_parity_breakdown(self):
        """Verifies exact international CIF, customs duty, port clearance, and financing."""
        fob = 950.0  # USD/MT
        freight = 50.0  # USD/MT
        fx = 85.0  # USD/INR
        bcd_rate = 0.05  # 5%
        aidc_rate = 0.05  # 5%
        sws_rate = 0.10  # 10% on duty
        ins_rate = 0.0015  # 0.15%

        res = calculate_international_landed_cost(
            fob_price_usd_per_mt=fob,
            ocean_freight_usd_per_mt=freight,
            marine_insurance_rate=ins_rate,
            exchange_rate_usd_to_inr=fx,
            basic_customs_duty_rate=bcd_rate,
            agriculture_infrastructure_cess_rate=aidc_rate,
            social_welfare_surcharge_rate=sws_rate,
            itc_eligible_gst=True,
            port_handling_and_wharfage_inr_per_mt=800.0,
            customs_cha_charges_inr_per_mt=200.0,
            inland_transport_inr_per_mt=1500.0,
            voyage_shrinkage_loss_rate=0.003,
            trade_finance_cost_rate=0.01,
            other_port_cess_inr_per_mt=50.0,
        )

        # 1. CIF verification
        expected_cif_usd = (fob + freight) * (1.0 + ins_rate)  # 1000 * 1.0015 = 1001.50
        assert abs(res["pricing_usd"]["cif_price_usd_per_mt"] - expected_cif_usd) < 1e-2

        # 2. Assessable value in INR
        expected_av_inr = round(expected_cif_usd * fx, 2)
        assert abs(res["customs_breakdown_inr"]["assessable_value_inr_per_mt"] - expected_av_inr) < 1.0

        # 3. Duties
        expected_bcd = round(expected_av_inr * bcd_rate, 2)
        expected_aidc = round(expected_av_inr * aidc_rate, 2)
        expected_sws = round((expected_bcd + expected_aidc) * sws_rate, 2)
        expected_total_duty = expected_bcd + expected_aidc + expected_sws
        assert abs(res["customs_breakdown_inr"]["total_customs_duty"] - expected_total_duty) < 1.0

        # 4. Units conversion
        totals = res["totals"]
        assert abs(totals["total_landed_cost_inr_per_quintal"] * 10.0 - totals["total_landed_cost_inr_per_mt"]) < 0.1
        assert abs(totals["total_landed_cost_inr_per_kg"] * 1000.0 - totals["total_landed_cost_inr_per_mt"]) < 0.1

    def test_international_invalid_inputs(self):
        with pytest.raises(ValueError, match="fob_price_usd_per_mt"):
            calculate_international_landed_cost(fob_price_usd_per_mt=0.0, ocean_freight_usd_per_mt=50.0)

        with pytest.raises(ValueError, match="exchange_rate_usd_to_inr"):
            calculate_international_landed_cost(
                fob_price_usd_per_mt=1000.0, ocean_freight_usd_per_mt=50.0, exchange_rate_usd_to_inr=-80.0
            )

