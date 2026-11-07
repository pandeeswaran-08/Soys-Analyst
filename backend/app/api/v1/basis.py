from typing import List
from fastapi import APIRouter
from app.services.seed_service import SeedService
from app.math.basis_pricing import calculate_basis, calculate_net_delivered_price, analyze_basis_historical_percentile

router = APIRouter()

@router.get("/bids")
async def get_basis_bids():
    return SeedService.get_sample_basis_bids()

@router.get("/historical-percentile")
async def get_basis_percentile(current_basis: float = -18.0):
    # Historical basis distribution for Central Illinois River
    historical_bids = [-35.0, -30.0, -28.0, -25.0, -22.0, -20.0, -18.0, -15.0, -12.0, -10.0, -5.0, +2.0]
    return analyze_basis_historical_percentile(current_basis, historical_bids)

@router.get("/spatial-arbitrage")
async def get_spatial_arbitrage():
    """Compares CIF NOLA export vs Interior Decatur Processor."""
    cif_nola = calculate_net_delivered_price(
        destination_cif_price=10.95,
        freight_cost=0.55,
        elevation_handling_cost=0.06,
        shrinkage_loss_percent=0.002,
    )
    return {
        "export_channel": "CIF Gulf NOLA",
        "breakdown": cif_nola,
        "interior_processor_bid": 10.38,
        "spread_to_interior": round(cif_nola["net_origin_price"] - 10.38, 4),
        "favorable_destination": "Export Port (Gulf NOLA)" if cif_nola["net_origin_price"] > 10.38 else "Interior Domestic Processor",
    }

