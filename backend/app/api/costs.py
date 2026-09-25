from fastapi import APIRouter, Query
from app.schemas.cost import CostBreakdownResponse, CurrencyConvertRequest
from app.services.cost.cost_service import calculate_cost_breakdown, convert_currency, EXCHANGE_RATES

router = APIRouter(prefix="/costs", tags=["Cost Calculator"])


@router.get("/estimate", response_model=CostBreakdownResponse)
async def get_cost_estimate(
    country: str = Query("Germany"),
    city: str = Query("Munich"),
    tuition: float = Query(0.0),
    living: float = Query(11500.0),
    base_currency: str = Query("EUR"),
    target_currency: str = Query("USD"),
    scholarship_offset: float = Query(0.0),
):
    return calculate_cost_breakdown(
        country=country,
        city=city,
        tuition_annual=tuition,
        living_annual=living,
        currency=base_currency,
        target_currency=target_currency,
        scholarship_offset_annual=scholarship_offset,
    )


@router.post("/convert")
async def convert(req: CurrencyConvertRequest):
    result = convert_currency(req.amount, req.from_currency, req.to_currency)
    return {
        "amount": req.amount,
        "from_currency": req.from_currency.upper(),
        "to_currency": req.to_currency.upper(),
        "converted_amount": result,
    }


@router.get("/currencies")
async def get_supported_currencies():
    return {
        "supported": list(EXCHANGE_RATES.keys()),
        "rates_to_eur_base": EXCHANGE_RATES,
    }
