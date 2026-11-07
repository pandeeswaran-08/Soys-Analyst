from fastapi import APIRouter
from app.schemas.crush import CrushCalculateRequest, CrushCalculateResponse
from app.math.crush_margin import calculate_comprehensive_crush

router = APIRouter()

@router.post("/calculate", response_model=CrushCalculateResponse)
async def calculate_crush(req: CrushCalculateRequest):
    result = calculate_comprehensive_crush(
        soybean_price_bu=req.soybean_price_bu,
        meal_price_ton=req.meal_price_ton,
        oil_price_lb_cents=req.oil_price_lb_cents,
        operating_crush_cost_bu=req.operating_crush_cost_bu,
        basis_soybean_bu=req.basis_soybean_bu,
        basis_meal_ton=req.basis_meal_ton,
        basis_oil_cents_lb=req.basis_oil_cents_lb,
        meal_yield_lbs=req.meal_yield_lbs,
        oil_yield_lbs=req.oil_yield_lbs,
    )
    return result

