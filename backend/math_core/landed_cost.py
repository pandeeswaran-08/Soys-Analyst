"""
Landed Cost Mathematical Engine
Pure, deterministic mathematical formulas for domestic procurement and international
import parity landed costs for agricultural commodities (e.g. Soybeans, Soybean Oil, Soybean Meal).

All functions are side-effect free, fully typed, and return clear breakdown dictionaries.
"""

from typing import Dict, Any, Optional


def calculate_domestic_landed_cost(
    base_price_per_unit: float,
    freight_per_unit: float,
    handling_per_unit: float = 0.0,
    mandi_tax_rate: float = 0.015,
    transit_insurance_rate: float = 0.001,
    in_transit_shrinkage_rate: float = 0.003,
    unloading_storage_per_unit: float = 0.0,
    gst_rate: float = 0.05,
    itc_eligible: bool = True,
    brokerage_commission_per_unit: float = 0.0,
) -> Dict[str, Any]:
    """
    Computes the total landed cost per unit for domestic commodity purchases (e.g., Mandi/Farmgate to Plant).

    Formulas:
        Mandi Tax = Base Price * Mandi Tax Rate
        Transit Insurance = Base Price * Transit Insurance Rate
        In-Transit Shrinkage = (Base Price + Freight) * In-Transit Shrinkage Rate
        Subtotal Pre-Tax = Base Price + Mandi Tax + Freight + Handling + Insurance + Shrinkage + Storage + Brokerage
        GST Amount = Base Price * GST Rate (or Subtotal * GST Rate depending on tax law; default on base)
        Net Landed Cost = Subtotal Pre-Tax + (GST Amount if not itc_eligible else 0.0)

    Args:
        base_price_per_unit: Farmgate or Mandi price per unit (e.g., INR/MT, INR/quintal, or $/bu)
        freight_per_unit: Primary road/rail freight cost per unit
        handling_per_unit: Loading, labor, bagging, and weighbridge charges
        mandi_tax_rate: APMC/Mandi cess fraction (e.g. 0.015 for 1.5%)
        transit_insurance_rate: Insurance rate as fraction of base price (e.g. 0.001 for 0.1%)
        in_transit_shrinkage_rate: Expected weight/moisture loss fraction (e.g. 0.003 for 0.3%)
        unloading_storage_per_unit: Destination unloading, lab assaying, and gate handling
        gst_rate: Goods and Services Tax rate fraction (e.g. 0.05 for 5%)
        itc_eligible: If True, GST is credited back and not part of the net cost
        brokerage_commission_per_unit: Brokerage fee paid per unit

    Returns:
        Full breakdown dictionary with all cost components, subtotals, and percentage shares.
    """
    if base_price_per_unit < 0:
        raise ValueError("base_price_per_unit cannot be negative")
    if freight_per_unit < 0:
        raise ValueError("freight_per_unit cannot be negative")
    if mandi_tax_rate < 0 or transit_insurance_rate < 0 or in_transit_shrinkage_rate < 0 or gst_rate < 0:
        raise ValueError("Tax, insurance, and shrinkage rates cannot be negative")

    # 1. Base material & statutory mandi levy
    mandi_tax_amount = round(base_price_per_unit * mandi_tax_rate, 4)
    gross_material_cost = round(base_price_per_unit + mandi_tax_amount, 4)

    # 2. Logistics & handling
    shrinkage_loss_amount = round((base_price_per_unit + freight_per_unit) * in_transit_shrinkage_rate, 4)
    total_logistics_handling = round(
        freight_per_unit + handling_per_unit + unloading_storage_per_unit + shrinkage_loss_amount, 4
    )

    # 3. Insurance & commercial fees
    insurance_amount = round(base_price_per_unit * transit_insurance_rate, 4)
    total_commercial_charges = round(insurance_amount + brokerage_commission_per_unit, 4)

    # 4. Tax treatment
    gst_amount = round(base_price_per_unit * gst_rate, 4)
    uncredited_gst = 0.0 if itc_eligible else gst_amount

    # 5. Landed total
    total_landed_cost = round(
        gross_material_cost + total_logistics_handling + total_commercial_charges + uncredited_gst, 4
    )

    # Cost percentage shares
    effective_base = total_landed_cost if total_landed_cost > 0 else 1.0
    material_pct = round((base_price_per_unit / effective_base) * 100.0, 2)
    logistics_pct = round((total_logistics_handling / effective_base) * 100.0, 2)
    fees_pct = round((total_commercial_charges / effective_base) * 100.0, 2)
    taxes_pct = round(((mandi_tax_amount + uncredited_gst) / effective_base) * 100.0, 2)

    return {
        "channel": "DOMESTIC",
        "base_price_per_unit": round(base_price_per_unit, 4),
        "mandi_tax_amount": mandi_tax_amount,
        "gross_material_cost": gross_material_cost,
        "freight_per_unit": round(freight_per_unit, 4),
        "handling_per_unit": round(handling_per_unit, 4),
        "unloading_storage_per_unit": round(unloading_storage_per_unit, 4),
        "shrinkage_loss_amount": shrinkage_loss_amount,
        "total_logistics_handling": total_logistics_handling,
        "transit_insurance_amount": insurance_amount,
        "brokerage_commission_per_unit": round(brokerage_commission_per_unit, 4),
        "total_commercial_charges": total_commercial_charges,
        "gst_amount": gst_amount,
        "itc_eligible": itc_eligible,
        "uncredited_gst_amount": uncredited_gst,
        "total_landed_cost_per_unit": total_landed_cost,
        "cost_breakdown_percentages": {
            "material_share_pct": material_pct,
            "logistics_share_pct": logistics_pct,
            "commercial_fees_share_pct": fees_pct,
            "taxes_and_cess_share_pct": taxes_pct,
        },
    }


def calculate_international_landed_cost(
    fob_price_usd_per_mt: float,
    ocean_freight_usd_per_mt: float,
    marine_insurance_rate: float = 0.0015,
    exchange_rate_usd_to_inr: float = 85.0,
    basic_customs_duty_rate: float = 0.05,
    agriculture_infrastructure_cess_rate: float = 0.05,
    social_welfare_surcharge_rate: float = 0.10,
    integrated_gst_rate: float = 0.05,
    itc_eligible_gst: bool = True,
    port_handling_and_wharfage_inr_per_mt: float = 850.0,
    customs_cha_charges_inr_per_mt: float = 250.0,
    inland_transport_inr_per_mt: float = 1800.0,
    voyage_shrinkage_loss_rate: float = 0.003,
    trade_finance_cost_rate: float = 0.012,
    other_port_cess_inr_per_mt: float = 50.0,
) -> Dict[str, Any]:
    """
    Computes international import parity landed cost for commodity shipments into Indian ports
    (e.g., Argentine/Brazilian Degummed Soy Oil or US/Brazilian Soybeans).

    Audited Customs Valuation Standard:
        CIF (USD/MT) = FOB + Ocean Freight + Marine Insurance
        CIF (INR/MT) = CIF (USD/MT) * Exchange Rate (USD/INR)
        Assessable Value (INR/MT) = CIF (INR/MT)
        Basic Customs Duty (BCD) = Assessable Value * BCD Rate
        Agriculture Infrastructure & Development Cess (AIDC) = Assessable Value * AIDC Rate
        Social Welfare Surcharge (SWS) = (BCD + AIDC) * SWS Rate (typically 10% on duties)
        Total Customs Duty = BCD + AIDC + SWS
        Value for IGST = Assessable Value + Total Customs Duty
        IGST Amount = Value for IGST * IGST Rate
        Customs Out-of-Charge Cost = Assessable Value + Total Customs Duty + (IGST if not itc_eligible)
        Port Clearance & Logistics = Port Handling + CHA + Inland Transport + Other Port Cess + Shrinkage
        Trade Finance & LC charges = Assessable Value * Trade Finance Cost Rate
        Total Landed Cost = Customs Out-of-Charge Cost + Port Clearance & Logistics + Trade Finance

    Args:
        fob_price_usd_per_mt: FOB price in USD per Metric Ton
        ocean_freight_usd_per_mt: Ocean freight to destination port in USD/MT
        marine_insurance_rate: Marine insurance rate as fraction of (FOB + Freight)
        exchange_rate_usd_to_inr: Currency exchange rate USD to INR
        basic_customs_duty_rate: Basic Customs Duty (BCD) fraction (e.g. 0.05 for 5%)
        agriculture_infrastructure_cess_rate: AIDC fraction (e.g. 0.05 for 5%)
        social_welfare_surcharge_rate: SWS fraction on duty (e.g. 0.10 for 10%)
        integrated_gst_rate: IGST fraction (e.g. 0.05 for 5%)
        itc_eligible_gst: Whether IGST can be claimed as input tax credit
        port_handling_and_wharfage_inr_per_mt: Port charges, wharfage, stevedoring in INR/MT
        customs_cha_charges_inr_per_mt: Customs House Agent and documentation in INR/MT
        inland_transport_inr_per_mt: Port-to-plant transportation in INR/MT
        voyage_shrinkage_loss_rate: Cargo ocean loss/shrinkage allowance
        trade_finance_cost_rate: LC issuance, buyer's credit, and hedging cost rate
        other_port_cess_inr_per_mt: Municipal/maritime board cess in INR/MT

    Returns:
        Full breakdown dictionary with all international components in USD and INR,
        per Metric Ton and per 100 kg (quintal).
    """
    if fob_price_usd_per_mt <= 0:
        raise ValueError("fob_price_usd_per_mt must be positive")
    if ocean_freight_usd_per_mt < 0:
        raise ValueError("ocean_freight_usd_per_mt cannot be negative")
    if exchange_rate_usd_to_inr <= 0:
        raise ValueError("exchange_rate_usd_to_inr must be positive")

    # 1. CIF in USD
    fob_plus_freight = fob_price_usd_per_mt + ocean_freight_usd_per_mt
    marine_insurance_usd = round(fob_plus_freight * marine_insurance_rate, 4)
    cif_price_usd_per_mt = round(fob_plus_freight + marine_insurance_usd, 4)

    # 2. Convert to INR Assessable Value
    assessable_value_inr_per_mt = round(cif_price_usd_per_mt * exchange_rate_usd_to_inr, 2)

    # 3. Customs Duties in INR
    bcd_amount = round(assessable_value_inr_per_mt * basic_customs_duty_rate, 2)
    aidc_amount = round(assessable_value_inr_per_mt * agriculture_infrastructure_cess_rate, 2)
    sws_amount = round((bcd_amount + aidc_amount) * social_welfare_surcharge_rate, 2)
    total_customs_duty = round(bcd_amount + aidc_amount + sws_amount, 2)

    # 4. Integrated GST (IGST)
    value_for_igst = round(assessable_value_inr_per_mt + total_customs_duty, 2)
    igst_amount = round(value_for_igst * integrated_gst_rate, 2)
    uncredited_igst = 0.0 if itc_eligible_gst else igst_amount

    # 5. Clearance, Port, & Shrinkage in INR
    voyage_shrinkage_inr = round(assessable_value_inr_per_mt * voyage_shrinkage_loss_rate, 2)
    total_port_and_clearance = round(
        port_handling_and_wharfage_inr_per_mt
        + customs_cha_charges_inr_per_mt
        + other_port_cess_inr_per_mt
        + voyage_shrinkage_inr,
        2,
    )

    # 6. Inland transport & financing
    total_inland_transport = round(inland_transport_inr_per_mt, 2)
    trade_finance_amount = round(assessable_value_inr_per_mt * trade_finance_cost_rate, 2)

    # 7. Total Landed Cost per MT (INR)
    total_landed_cost_inr_per_mt = round(
        assessable_value_inr_per_mt
        + total_customs_duty
        + uncredited_igst
        + total_port_and_clearance
        + total_inland_transport
        + trade_finance_amount,
        2,
    )

    # Equivalent measures
    total_landed_cost_inr_per_quintal = round(total_landed_cost_inr_per_mt / 10.0, 2)  # 1 MT = 10 Quintals
    total_landed_cost_inr_per_kg = round(total_landed_cost_inr_per_mt / 1000.0, 4)
    total_landed_cost_usd_per_mt = round(total_landed_cost_inr_per_mt / exchange_rate_usd_to_inr, 2)

    return {
        "channel": "INTERNATIONAL_IMPORT",
        "currency_pair": "USD/INR",
        "exchange_rate": exchange_rate_usd_to_inr,
        "pricing_usd": {
            "fob_price_usd_per_mt": round(fob_price_usd_per_mt, 2),
            "ocean_freight_usd_per_mt": round(ocean_freight_usd_per_mt, 2),
            "marine_insurance_usd_per_mt": marine_insurance_usd,
            "cif_price_usd_per_mt": cif_price_usd_per_mt,
        },
        "customs_breakdown_inr": {
            "assessable_value_inr_per_mt": assessable_value_inr_per_mt,
            "basic_customs_duty_bcd": bcd_amount,
            "agriculture_infrastructure_cess_aidc": aidc_amount,
            "social_welfare_surcharge_sws": sws_amount,
            "total_customs_duty": total_customs_duty,
            "effective_customs_duty_pct": round(
                (total_customs_duty / assessable_value_inr_per_mt) * 100.0, 2
            ),
            "igst_amount": igst_amount,
            "itc_eligible_gst": itc_eligible_gst,
            "uncredited_igst": uncredited_igst,
        },
        "logistics_and_handling_inr": {
            "port_handling_and_wharfage": port_handling_and_wharfage_inr_per_mt,
            "customs_cha_charges": customs_cha_charges_inr_per_mt,
            "other_port_cess": other_port_cess_inr_per_mt,
            "voyage_shrinkage_loss": voyage_shrinkage_inr,
            "total_port_clearance": total_port_and_clearance,
            "inland_transport_port_to_plant": total_inland_transport,
        },
        "financing_charges_inr": {
            "trade_finance_and_hedging": trade_finance_amount,
            "trade_finance_rate_pct": round(trade_finance_cost_rate * 100.0, 2),
        },
        "totals": {
            "total_landed_cost_inr_per_mt": total_landed_cost_inr_per_mt,
            "total_landed_cost_inr_per_quintal": total_landed_cost_inr_per_quintal,
            "total_landed_cost_inr_per_kg": total_landed_cost_inr_per_kg,
            "total_landed_cost_usd_per_mt": total_landed_cost_usd_per_mt,
        },
        "cost_percentages": {
            "cif_base_share_pct": round(
                (assessable_value_inr_per_mt / total_landed_cost_inr_per_mt) * 100.0, 2
            ),
            "duties_and_taxes_share_pct": round(
                ((total_customs_duty + uncredited_igst) / total_landed_cost_inr_per_mt) * 100.0, 2
            ),
            "port_and_inland_logistics_share_pct": round(
                ((total_port_and_clearance + total_inland_transport) / total_landed_cost_inr_per_mt) * 100.0, 2
            ),
            "finance_share_pct": round(
                (trade_finance_amount / total_landed_cost_inr_per_mt) * 100.0, 2
            ),
        },
    }

